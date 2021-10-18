$(document).ready(function () {
	const product = JSON.parse($('#prodData').text());
	console.log(product);
	const productCarousel = $('.single-product');
	const productQty = $('#product-quantity');
	const minusQty = $('#minus-quantity');
	minusQty.prop('disabled', true);
	minusQty.addClass('quantity-btn-disabled');
	const plusQty = $('#plus-quantity');
	let paymentDetails = {};

	$.each(product.images, (index, value) => {
		const item = `<div class="product-image "><img src="/media/${value}" alt="product"></div>`;
		addAndRefreshCarousel(productCarousel, item);
	});
	console.log(product);
	$('#name').text(product.name);
	$('#price').text(commaSeparator(product.unit_price));
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

	$('#proceedPayment').on('click', (e) => {
		e.preventDefault();
		$('#purchaseModal').modal('show');
	});

	$('#purchase').on('click', function (e) {
		console.log('################');
		e.preventDefault();
		console.log('$$$$$$$$');
		console.log($('#mobile_number').val());

		if ($('#mobile_number').val().trim() == '') {
			showNotify('mobile number is required', 'danger');
			return;
		}

		if ($('#shipping_address').val().trim() == '') {
			showNotify('shipping address is required', 'danger');
			return;
		}

		paymentDetails = {
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
					$('#payableAmount').html(
						paymentDetails.amount * paymentDetails.quantity +
							paymentDetails.service_charge
					);
					$('#accountNumber').html(localStorage.getItem('kwari_username'));
					showNotify(
						'transaction intiated, please make payment within 30 minutes',
						'success'
					);
				} else {
					$('#preloader').hide();
					showErrorMsg(response['message']);
				}
			},
		});
	});

	function toggleOnDecrease() {
		minusQty.prop('disabled', productQty.val() == 1 ? true : false);
		minusQty[productQty.val() == 1 ? 'addClass' : 'removeClass'](
			'quantity-btn-disabled'
		);
	}

	function toggleOnIncrease(value) {
		plusQty.prop('disabled', value == product.quantity_left ? true : false);
		plusQty[value == product.quantity_left ? 'addClass' : 'removeClass'](
			'quantity-btn-disabled'
		);
	}

	productQty.change(function ({ target: { value } }) {
		if (
			Number(value) < 1 ||
			value != parseInt(value, 10) ||
			value > product.quantity_left
		)
			value = 1;

		productQty.val(value);

		toggleOnDecrease();

		toggleOnIncrease(value);
	});

	minusQty.on('click', function () {
		productQty.val(Number(productQty.val()) - 1).trigger('change');
	});
	plusQty.on('click', function () {
		productQty.val(Number(productQty.val()) + 1).trigger('change');
	});
});
