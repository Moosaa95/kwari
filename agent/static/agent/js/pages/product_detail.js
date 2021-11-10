$(document).ready(function () {
	const csrf_token = readCookie('csrftoken');
	const product = JSON.parse($('#prodData').text());
	console.log(product);
	const productCarousel = $('.single-product');
	const productQty = $('#product-quantity');
	const minusQty = $('#minus-quantity');
	minusQty.prop('disabled', true);
	minusQty.addClass('quantity-btn-disabled');
	const plusQty = $('#plus-quantity');
	let paymentDetails = {};
	let quantity = 1;
	let service_charge;
	const charges_structure = JSON.parse(product.charges_structure);

	$.each(product.images, (_, value) => {
		const item = `<div class="product-image "><img src="/media/${value}" alt="product"></div>`;
		addAndRefreshCarousel(productCarousel, item);
	});
	$('#name').text(product.name);
	$('#price').text(commaSeparator(product.unit_price));
	$('#qty').text(commaSeparator(product.quantity_left.toString()));
	$.each(charges_structure, (_, value) => {
		$('#charges_structure').append(`
		<h5 class="item-price">
			<span>Quantity: ${value.start} - ${value.end}</span>
			<span>Service Charge: <i>&#8358;</i>${value.charges} per quantity</span>
		</h5>`);
	});

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
		quantity = $('#product-quantity').val();
		service_charge = charges_structure.find(
			(structure) =>
				Number(structure.start) <= Number(quantity) &&
				Number(structure.end) >= Number(quantity)
		).charges;
		$('#purchaseModal').modal('show');
	});

	$('#purchase').on('click', function (e) {
		e.preventDefault();
		const shipping_address = $('#shipping_address').val().trim();
		const mobile_number = $('#mobile_number').val().trim();

		if (shipping_address == '') {
			showNotify('shipping address is required', 'danger');
			return;
		}

		if (mobile_number == '') {
			showNotify('mobile number is required', 'danger');
			return;
		}

		if (!service_charge) {
			showNotify(
				'inputted quantity is not within service charge structure',
				'danger'
			);
			return;
		}

		paymentDetails = {
			quantity,
			amount: product.unit_price,
			transaction_description: 'bank transfer payment',
			product_id: product.id,
			service_charge,
			payment_type: 'bank transfer',
			mobile_number,
			shipping_address,
		};

		$.ajax({
			url: '/agent/create_transaction',
			method: 'post',
			headers: { 'X-CSRFToken': csrf_token },
			data: paymentDetails,
			beforeSend: function () {
				$('#preloader').show();
			},
			success: function (response, status, xhr, $form) {
				if (response.status) {
					$('#purchaseModal').modal('hide');
					$('#accountDetails').modal('show');
					$('#payableAmount').html(`
						&#8358;
						${
							paymentDetails.amount * paymentDetails.quantity +
							paymentDetails.service_charge * paymentDetails.quantity
						}`);
					$('#accountNumber').html(response.account_number);
					showNotify(
						'transaction intiated, please make payment within 30 minutes',
						'success'
					);
				} else {
					$('#preloader').hide();
					showErrorMsg(response['message']);
				}
			},
			error: () => {
				$('#preloader').hide();
				showErrorMsg('An error has occured, please try again');
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
