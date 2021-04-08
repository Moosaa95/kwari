var AccountsTable = function() {
	var initTable1 = function() {
		var table = $('#accountsTable');
		// begin first table
		table.DataTable({
			responsive: true,
			searchDelay: 500,
//			processing: true,
//			serverSide: true,
			ajax: {
			    url:'accounts',
			    type:'POST',
			    dataSrc: ''
				},

			columns: [
				{data: 'sn'},
				{data: 'account_name'},
				{data: 'account_number'},
				// {data: 'terminals'},
				{data: 'today_transactions'},
				{data: 'last_transaction_date'},
				{data: 'status'},
				{data: 'Actions', responsivePriority: -1},
			],
			columnDefs: [
				{
					targets: -1,
					title: 'Actions',
					orderable: false,
					render: function(data, type, full, meta) {
						return `
                        <a href="account_detail?account_id=${full.id}" class="btn btn-sm btn-clean btn-icon btn-icon-md" title="Generate Report">
                          <i class="la la-print"></i>
                        </a>
                        <a href="account_detail?account_id=${full.id}" class="btn btn-sm btn-clean btn-icon btn-icon-md" title="View">
                          <i class="la la-edit"></i>
                        </a>`;
					},
				},
				{
					targets: -2,
					render: function(data, type, full, meta) {
						var status = {
							1: {'title': 'Active', 'class': ' kt-badge--success'},
							2: {'title': 'Inactive', 'class': ' kt-badge--warning'},
//							3: {'title': 'Failed', 'class': ' kt-badge--danger'},
//							4: {'title': 'Warning', 'class': 'kt-badge--brand'},
//							5: {'title': 'Info', 'class': ' kt-badge--info'},
//							6: {'title': 'Delivered', 'class': ' kt-badge--danger'},
//							7: {'title': 'Canceled', 'class': ' kt-badge--primary'},
						};
						if (typeof status[data] === 'undefined') {
							return data;
						}
						return '<span class="kt-badge ' + status[data].class + ' kt-badge--inline kt-badge--pill">' + status[data].title + '</span>';
					},
				},

			],
		});
	};

	return {

		//main function to initiate the module
		init: function() {
			initTable1();
		},

	};

}();

$(document).ready(function(){
    AccountsTable.init();
    $('#transactionBreakDown').on('show.bs.modal', function(e) {

        //get data-props attribute of the clicked element
        var decoded_props = atob($(e.relatedTarget).data('props'));
        props = JSON.parse(decoded_props);


        //populate the textbox
        $('#dailyTransferNumber').text(props.transfers.number_today_transfers);
        $('#dailyTransferValue').text(props.transfers.today_transfers_value);
        $('#dailyWithdrawalNumber').text(props.withdrawals.number_today_withdrawals);
        $('#dailyWithdrawalValue').text(props.withdrawals.today_withdrawals_value);
    });

    $('#fundMerchant').on('show.bs.modal', function(e) {
        //populate the textbox
        var merchantName = $(e.relatedTarget).data('name');
        var merchantPk = $(e.relatedTarget).data('pk');
        $(e.currentTarget).find('input[name="pk"]').val(merchantPk);
        $(e.currentTarget).find('input[name="merchantName"]').val(merchantName);
    });

    $('#fund').on('click', function(e){
        //e.preventDefault();
        var pk = $('#fundMerchant').find('input[name="pk"]').val();
        var merchantName = $('#fundMerchant').find('input[name="merchantName"]').val();
        var amount = $('#fundMerchantAmountInput').val();
        $('#fundMerchant').modal('hide');
        $('#confirmFundMerchant').on('show.bs.modal', function(e) {
            //populate the textbox
            $('#merchantName').text(merchantName);
            $('#fundingAmount').text(amount);
            $('#pk').text(pk);
        });
        $('#confirmFundMerchant').modal('show');

    });

    $('#confirmFund').on('click', function(e){
        //e.preventDefault();
        $('#confirmFund').attr('disabled', true)
        var pk = $('#pk').text();
        var amount = removeCommas($('#fundingAmount').text());
        $.ajax({
                url: 'fund_merchant',
                type: 'POST',
                dataType: 'json',
                data:{
                    id: pk,
                    amount: amount
                },
                success:function(data) {
                        window.location.href = 'merchants'
                        $('#successMessage').append('<div class="alert alert-success" role="alert">\
                                        <div class="alert-icon"><i class="flaticon2-check-mark"></i></div>\
                                        <div class="alert-text">Merchant has been funded successfully</div>\
                                        <div class="alert-close">\
                                            <button type="button" class="close" data-dismiss="alert" aria-label="Close">\
                                                <span aria-hidden="true"><i class="la la-close"></i></span>\
                                            </button>\
                                        </div>\
                                    </div>'
                               );

                }
        });

    });

     $('#editMerchant').on('show.bs.modal', function(e) {
        var merchantPk = $(e.relatedTarget).data('pk');
        $('#withdrawalPercentage').prop('checked', false);
        $('#withdrawalFixed').prop('checked', false);
        $('#withdrawalMerchantId').val(merchantPk);
        $('#transferMerchantId').val(merchantPk);

        $.ajax({
                url: 'merchants',
                type: 'POST',
                data: {fetch: true, pk: merchantPk},
                success:function(data) {

                     $('#merchantDetailForm').find('input').val(function () {
                        return data.details[this.id];
                     });

                     $('#bandStart').val(data.withdrawal_charge.structure[0].band[0]);
                     $('#bandEnd').val(data.withdrawal_charge.structure[0].band[1]);
                     $('#xbCharge').val(data.withdrawal_charge.structure[0].xb_charges);
                     $('#bankCharge').val(data.withdrawal_charge.structure[0].bank_charges);

                     data.withdrawal_charge.structure_type=='percent' ? $('#withdrawalPercentage').prop('checked', true) : $('#withdrawalFixed').prop('checked', true)

                     $('#transferBandStart').val(data.transfer_charge.structure[0].band[0]);
                     $('#transferBandEnd').val(data.transfer_charge.structure[0].band[1]);
                     $('#transferXbCharge').val(data.transfer_charge.structure[0].xb_charges);
                     $('#transferBankCharge').val(data.transfer_charge.structure[0].bank_charges);

                     data.transfer_charge.structure_type=='percent' ? $('#transferPercentage').prop('checked', true) : $('#transferFixed').prop('checked', true)

                }
            });


     });

     $('#updateDetail').on('click', function(e){
        var form = document.getElementById("merchantDetailForm");
        var formData = new FormData(form);
        $.ajax({
            url: 'update_merchant',
            type: 'POST',
            dataType: 'json',
            data: formData,
            processData: false,
            contentType: false,
            beforeSend : function() {
                         $('#updateDetail').addClass('kt-spinner kt-spinner--v2 kt-spinner--sm kt-spinner--success kt-spinner--right kt-spinner--input');
                        },
            success:function(data) {
                setTimeout(function(){
                    if (!data.error){
                        $('#modalAlert').html(
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
                       $('#modalAlert').html(
                            '<div class="alert alert-outline-danger fade show" role="alert">\
                                <div class="alert-icon"><i class="flaticon-questions-circular-button"></i></div>\
                                <div class="alert-text" id="errorMessage">'+ data.message +'</div>\
                                <div class="alert-close">\
                                    <button type="button" class="close" data-dismiss="alert" aria-label="Close">\
                                        <span aria-hidden="true"><i class="la la-close"></i></span>\
                                    </button>\
                                </div>\
                            </div>'
                       );
                    }
                    $('#updateDetail').removeClass('kt-spinner kt-spinner--v2 kt-spinner--sm kt-spinner--success kt-spinner--right kt-spinner--input');
                }, 2000);

            }
        });
     });

     $('#updateWithdrawalCharge').on('click', function(e){
        var form = document.getElementById("withdrawalChargeForm");
        var formData = new FormData(form);
        $.ajax({
            url: 'update_withdrawal_charge',
            type: 'POST',
            dataType: 'json',
            data: formData,
            processData: false,
            contentType: false,
            beforeSend : function() {
                         $('#updateWithdrawalCharge').addClass('kt-spinner kt-spinner--v2 kt-spinner--sm kt-spinner--success kt-spinner--right kt-spinner--input');
                        },
            success:function(data) {
                setTimeout(function(){
                    if (!data.error){
                        $('#modalAlert').html(
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
                       $('#modalAlert').html(
                            '<div class="alert alert-outline-danger fade show" role="alert">\
                                <div class="alert-icon"><i class="flaticon-questions-circular-button"></i></div>\
                                <div class="alert-text" id="errorMessage">'+ data.message +'</div>\
                                <div class="alert-close">\
                                    <button type="button" class="close" data-dismiss="alert" aria-label="Close">\
                                        <span aria-hidden="true"><i class="la la-close"></i></span>\
                                    </button>\
                                </div>\
                            </div>'
                       );
                    }
                    $('#updateWithdrawalCharge').removeClass('kt-spinner kt-spinner--v2 kt-spinner--sm kt-spinner--success kt-spinner--right kt-spinner--input');
                }, 2000);

            }
        });
     });

     $('#updateTransferCharge').on('click', function(e){
        var form = document.getElementById("transferChargeForm");
        var formData = new FormData(form);
        $.ajax({
            url: 'update_transfer_charge',
            type: 'POST',
            dataType: 'json',
            data: formData,
            processData: false,
            contentType: false,
            beforeSend : function() {
                         $('#updateTransferCharge').addClass('kt-spinner kt-spinner--v2 kt-spinner--sm kt-spinner--success kt-spinner--right kt-spinner--input');
                        },
            success:function(data) {
                setTimeout(function(){
                    if (!data.error){
                        $('#modalAlert').html(
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
                       $('#modalAlert').html(
                            '<div class="alert alert-outline-danger fade show" role="alert">\
                                <div class="alert-icon"><i class="flaticon-questions-circular-button"></i></div>\
                                <div class="alert-text" id="errorMessage">'+ data.message +'</div>\
                                <div class="alert-close">\
                                    <button type="button" class="close" data-dismiss="alert" aria-label="Close">\
                                        <span aria-hidden="true"><i class="la la-close"></i></span>\
                                    </button>\
                                </div>\
                            </div>'
                       );
                    }
                    $('#updateTransferCharge').removeClass('kt-spinner kt-spinner--v2 kt-spinner--sm kt-spinner--success kt-spinner--right kt-spinner--input');
                }, 2000);

            }
        });
     });

});
