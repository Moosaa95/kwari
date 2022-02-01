function showErrorMsg(msg) {
	$('#warning').removeClass('d-none');
	$('#warningMessage').text(msg);
}

$(document).ready(function () {
	$('#loginBtn').click(function (e) {
		e.preventDefault();
		const formData = serializeForm('#loginForm');
		console.log(formData);
		$.ajax({
			url: '/agent/login',
			method: 'post',
			data: formData,
			beforeSend: function () {
				$('#preloader').show();
			},
			success: function (response, status, xhr, $form) {
				if ('url' in response) {
					console.log(response.url);
					localStorage.setItem('kwari_username', formData.username);
					window.location.href = response['url'];
				} else {
					$('#preloader').hide();
					showErrorMsg(response['message']);
				}
			},
		});
	});

	$('#resetPasswordBtn').click(function (e) {
		e.preventDefault();
		const username = $('#resetUserName').val();
		$.ajax({
			method: 'post',
			url: '/agent/reset_password',
			data: { username: username },
			beforeSend: function () {
				$('#preloader').show();
			},
			success: function (response, status, xhr, $form) {
				if (response.status) {
					$('#resetPasswordModal').modal('hide');
					showErrorMsg('password reset successfully.Please check your mail.');
				} else {
					showErrorMsg('password reset unsuccessfully.');
				}
				$('#preloader').hide();
			},
		});
	});
});
