"use strict";

// Class definition
var KTUserProfile = function () {
	// Base elements
	var avatar;
	var offcanvas;

	// Private functions
	var initAside = function () {
		// Mobile offcanvas for mobile mode
		offcanvas = new KTOffcanvas('kt_user_profile_aside', {
            overlay: true,  
            baseClass: 'kt-app__aside',
            closeBy: 'kt_user_profile_aside_close',
            toggleBy: 'kt_subheader_mobile_toggle'
        }); 
	}

	var initUserForm = function() {
		avatar = new KTAvatar('kt_user_avatar');
	}

	return {
		// public functions
		init: function() {
			initAside();
			initUserForm();
		}
	};
}();

KTUtil.ready(function() {	
	KTUserProfile.init();
});

$(document).ready(function(){
    var data = JSON.parse(JSON.parse($('#userData').text()));
    $('#userName').text((data.firstName + ' ' + data.surname).toUpperCase());
    $('#userEmail').text(data.email);
    $('#userPhone').text(data.mobileNumber);
    $('#userAddress').text(data.address);

    $('#profileForm').find('input').val(function () {
        return data[this.id];
    });

    // on submit profile
    $('#submitProfile').click(function(e) {
        e.preventDefault();
        var form = document.getElementById("profileForm");
        var formData = new FormData(form);
        $.ajax({
            url: 'profile',
            type: 'POST',
            dataType: 'json',
            data: formData,
            processData: false,
            contentType: false,
            beforeSend : function() {
                         $('#submitProfile').addClass('kt-spinner kt-spinner--v2 kt-spinner--sm kt-spinner--success kt-spinner--right kt-spinner--input');
                        },
            success:function(data) {
                if (!data.error){
                    $('#alerts').html(
                        '<div class="alert alert-outline-success fade show" role="alert" >\
                            <div class="alert-icon"><i class="flaticon-warning"></i></div>\
                            <div class="alert-text" id="successMessage"></div>\
                            <div class="alert-close">\
                                <button type="button" class="close" data-dismiss="alert" aria-label="Close">\
                                    <span aria-hidden="true"><i class="la la-close"></i></span>\
                                </button>\
                            </div>\
                        </div>'
                    );
                }
                else{
                    $('#alert').html(
                        '<div class="alert alert-outline-danger fade show" role="alert">\
                            <div class="alert-icon"><i class="flaticon-questions-circular-button"></i></div>\
                            <div class="alert-text" id="errorMessage"></div>\
                            <div class="alert-close">\
                                <button type="button" class="close" data-dismiss="alert" aria-label="Close">\
                                    <span aria-hidden="true"><i class="la la-close"></i></span>\
                                </button>\
                            </div>\
                        </div>'
                    );

                }

                $('#submitProfile').removeClass('kt-spinner kt-spinner--v2 kt-spinner--sm kt-spinner--success kt-spinner--right kt-spinner--input');

                setTimeout(function()
                    {

	                }, 2000);

            }
        });
    });

    $('#submitPassword').click(function(e){
        e.preventDefault();
        var form = document.getElementById("passwordForm");
        var formData = new FormData(form);
        $.ajax({
            url: 'change_password',
            type: 'POST',
            dataType: 'json',
            data: formData,
            processData: false,
            contentType: false,
            beforeSend : function() {
                         $('#submitProfile').addClass('kt-spinner kt-spinner--v2 kt-spinner--sm kt-spinner--success kt-spinner--right kt-spinner--input');
                        },
            success:function(data) {
                if (!data.error){
                    $('#alerts').html(
                        '<div class="alert alert-outline-success fade show" role="alert" >\
                            <div class="alert-icon"><i class="flaticon-warning"></i></div>\
                            <div class="alert-text" id="successMessage">'+ data.message +'</div>\
                            <div class="alert-close">\
                                <button type="button" class="close" data-dismiss="alert" aria-label="Close">\
                                    <span aria-hidden="true"><i class="la la-close"></i></span>\
                                </button>\
                            </div>\
                        </div>'
                    );
                }
                else{
                    $('#alert').html(
                        '<div class="alert alert-outline-danger fade show" role="alert">\
                            <div class="alert-icon"><i class="flaticon-questions-circular-button"></i></div>\
                            <div class="alert-text" id="errorMessage">'+data.message+'</div>\
                            <div class="alert-close">\
                                <button type="button" class="close" data-dismiss="alert" aria-label="Close">\
                                    <span aria-hidden="true"><i class="la la-close"></i></span>\
                                </button>\
                            </div>\
                        </div>'
                    );

                }

                $('#submitProfile').removeClass('kt-spinner kt-spinner--v2 kt-spinner--sm kt-spinner--success kt-spinner--right kt-spinner--input');

                $(window).scrollTop(0);

            }
        });
    });



});
