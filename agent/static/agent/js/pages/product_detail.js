$(document).ready(function () {
	const product = JSON.parse($('#prodData').text());
	console.log(product);
	const productCarousel = $('.single-product');
	const tabs = $('#tabsDiv');
	const productQty = $('#product-quantity');
	const minusQty = $('#minus-quantity');
	minusQty.prop('disabled', true);
	minusQty.addClass('quantity-btn-disabled');
	const plusQty = $('#plus-quantity');
	let latest = '';
	let productImages = [];
	// $.each(product.images, (index,value)=>{
	//     $("#productImages").append(
	//         `<div class="item">
	//             <img src="/media/${value}" alt="${value}">
	//         </div>`
	//     )
	// });
	// rebuildCarousel(productCarousel)

	$.each(product.images, (index, value) => {
		const item = `<div class="product-image "><img src="/media/${value}" alt="product"></div>`;
		addAndRefreshCarousel(productCarousel, item);
	});
	console.log(product);
	$('#name').text(product.name);
	$('#price').text(commaSeparator(product.agent_price));
	$('#qty').text(commaSeparator(product.quantity_left.toString()));

	$('#share').on('click', function (e) {
		e.preventDefault();
		if (navigator.canShare && navigator.canShare({ files: product.images })) {
			navigator
				.share({
					files: product.images,
					title: product.name,
					text: `Photos of ${product.name}.`,
				})
				.then(() => console.log('Share was successful.'))
				.catch((error) => console.log('Sharing failed', error));
		} else {
			console.log(`Your system doesn't support sharing files.`);
		}
	});

	$('#purchase').on('click', function (e) {
		console.log('################');
		e.preventDefault();

		const paymentDetails = {
			quantity: $('#product-quantity').val(),
			amount: product.agent_price,
			transaction_description: 'bank transfer payment',
			product_id: product.id,
			service_charge: product.service_charge,
			payment_type: 'bank transfer',
		};

		console.log(paymentDetails);

		$.ajax({
			url: '/agent/create_transaction',
			method: 'post',
			data: paymentDetails,
			beforeSend: function () {
				$('#preloader').show();
			},
			success: function (response, status, xhr, $form) {
				if (response.status) {
					$('#accountDetails').modal('show');
					$('#payableAmount').html(product.agent_price);
					$('#accountNumber').html(localStorage.getItem('kwari_username'));
					alert('transaction intiated, make payment within 30 minutes');
				} else {
					$('#preloader').hide();
					showErrorMsg(response['message']);
				}
			},
		});
	});

	productQty.change(function ({ target: { value } }) {
		if (value < 1 || Number(value) !== 'NaN') productQty.val(1);
	});

	minusQty.on('click', function () {
		productQty.val(Number(productQty.val()) - 1);
		minusQty.prop('disabled', productQty.val() == 1 ? true : false);
		minusQty[productQty.val() == 1 ? 'addClass' : 'removeClass'](
			'quantity-btn-disabled'
		);
	});
	plusQty.on('click', function () {
		productQty.val(Number(productQty.val()) + 1);
		minusQty.prop('disabled', productQty.val() == 1 ? true : false);
		minusQty[productQty.val() == 1 ? 'addClass' : 'removeClass'](
			'quantity-btn-disabled'
		);
	});
});
