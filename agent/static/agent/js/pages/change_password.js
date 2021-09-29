var showErrorMsg = function (msg) {
	$('#warning').show();
	$('#warningMessage').text(msg);
};

$(document).ready(function () {
	var dev_id;
	try {
		dev_id = Android.getDeviceId();
		$('#id_device_id').val(dev_id);
	} catch (err) {
		$('#warning').show();
		$('#id_device_id').val('1234567890');
	}

	$('#changePasswordBtn').click(function (e) {
		e.preventDefault();
		var btn = $(this);
		const formData = serializeForm('#changePasswordForm');
		$.ajax({
			url: '/agent/change_password',
			method: 'POST',
			data: formData,
			beforeSend: function () {
				$('#preloader').show();
			},
			success: function (response, status, xhr, $form) {
				console.log(response);
				if (response['status']) {
					window.location.href = '/agent/home';
				} else {
					showErrorMsg(response['message']);
				}
				$('#preloader').hide();
			},
		});
	});
});
