var MerchantsDataTable = function() {
	// Private functions
	var demo = function() {
        var datatable = $('.kt-datatable-merchants').KTDatatable({
              // datasource definition
              data: {
                        type: 'remote',
                        source: {
                            read: {
                                url: 'merchants',
                                // sample custom headers
                                //headers: {'x-my-custokt-header': 'some value', 'x-test-header': 'the value'},
                                map: function(raw) {
                                    // sample data mapping
                                    var dataSet = raw;
                                    if (typeof raw.data !== 'undefined') {
                                        dataSet = raw.data;
                                    }
                                    return dataSet;
                                },
                            },
                        },
                        pageSize: 10,
                        serverPaging: false,
                        serverFiltering: false,
                        serverSorting: false,
                    },

              // layout definition
              layout: {
                scroll: false,
                footer: false,
              },

              // column sorting
              sortable: true,

              pagination: true,

              search: {
                input: $('#merchant_search'),
              },

              // columns definition
              columns: [
                {
                  field: 'id',
                  title: '#',
                  sortable: 'asc',
                  width: 40,
                  type: 'number',
                  selector: false,
                }, {
                  field: 'name',
                  title: 'Merchant',
                  template: function(row) {
                    return '<span style="font-size:15px; font-weight:bold;">' + row.name + '</span>';
                  },

                }, {
                  field: 'transactions',
                  title: 'Transactions',
                  template: function(row) {
                    return '<span style="font-size:15px; font-weight:bold;">' + row.transactions + '</span>';
                  },
                }, {
                  field: 'balance',
                  title: 'Balance',
                  template: function(row) {
                    return '<span style="font-size:15px; font-weight:bold;">' + row.balance + '</span>';
                  },
                },{
                  field: 'status',
                  title: 'Status',
                  // callback function support for column rendering
                  template: function(row) {
                    var status = {
                      1: {'title': 'Active', 'class': ' kt-badge--success'},
                      2: {'title': 'Inactive', 'class': ' kt-badge--danger'},
                      3: {'title': 'Pending', 'class': 'kt-badge--brand'},
                      4: {'title': 'Delivered', 'class': ' kt-badge--metal'},
                      5: {'title': 'Canceled', 'class': ' kt-badge--primary'},
                      6: {'title': 'Info', 'class': ' kt-badge--info'},
                      7: {'title': 'Warning', 'class': ' kt-badge--warning'},
                    };
                    return '<span class="kt-badge ' + status[row.status].class +
                           ' kt-badge--inline kt-badge--pill">' + status[row.status].title + '</span>';
                  },
                }, {
                  field: 'Actions',
                  title: 'Actions',
                  sortable: false,
                  width: 200,
                  overflow: 'visible',
                  textAlign: 'center',
                  template: function(row, index, datatable) {
                    var dropup = (datatable.getPageSize() - index) <= 4 ? 'dropup' : '';
                    merchant_data = JSON.stringify(row.details);
                    encoded_merchant_data = btoa(merchant_data);
                    return '<div class="dropdown /' + dropup + '">\
                                    <a href="#" class="btn btn-hover-brand btn-icon btn-pill" data-toggle="dropdown">\
                                        <i class="la la-ellipsis-h"></i>\
                                    </a>\
                                    <div class="dropdown-menu dropdown-menu-right">\
                                        <a class="dropdown-item" href="#" data-toggle="modal" data-target="#editMerchant" data-pk='+row.pk+'>\
                                            <i class="la la-edit"></i>\
                                            Edit Details\
                                        </a>\
                                        <a class="dropdown-item" href="#" data-toggle="modal"\
                                        data-target="#fundMerchant" data-pk='+row.pk+' data-name='+row.name+'>\
                                        <i class="la la-money"></i> Fund Merchant</a>\
                                        <a class="dropdown-item" href="#"><i class="la la-print"></i> Generate Report</a>\
                                    </div>\
                                </div>\
                                <a href="#" data-toggle="modal" data-target="#transactionBreakDown"\
                                    data-props='+encoded_merchant_data+' class="btn btn-hover-brand btn-icon btn-pill"\
                                    title="Analysis">\
                                    <i class="la la-edit"></i>\
                                </a>';
                  },
                }],

            });

        $('#kt_form_status').on('change', function() {
          datatable.search($(this).val().toLowerCase(), 'Status');
        });

        $('#kt_form_type').on('change', function() {
          datatable.search($(this).val().toLowerCase(), 'Type');
        });

        $('#kt_form_status,#kt_form_type').selectpicker();

        };
	return {
		// public functions
		init: function() {
			demo();
		},
	};
}();


$(document).ready(function(){

    function separator(nStr) {
        var nStr1=nStr.replace(/,/g, "");
        var patt = new RegExp(/(\d+)(\d{3})/);
        while (patt.test(nStr1)) {
              nStr1=nStr1.replace(patt, '$1,$2');
        }
        return nStr1
    }

    function removeCommas(number) {
        var newNumber=number.replace(/,/g, "");
        return newNumber
    }

    $(".add-commas").on('keyup',function(){
        var m = separator($(this).val());
        $(this).val(m)
    });


    MerchantsDataTable.init();

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
