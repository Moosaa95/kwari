"use strict";
const TransactionsTable = function(tableData) {

	const initTable1 = function(tableData) {
		const table = $('#transactionsTable');

		// begin first table
		table.DataTable({
			responsive: true,
			searchDelay: 500,
//			processing: true,
//			serverSide: true,
//			ajax: {
//			    url:'transactions',
//			    type:'POST',
//			    dataSrc: ''
//				},
            data:tableData,

			columns: [
				{data: 'sn'},
				{data: 'status'},
                {data: 'account__account_name'},
                {data: 'transaction_description'},
                {data: 'terminal_id'},
                {data: 'amount'},
                {data: 'charges'},
                {data: 'agent_commission'},
                {data: 'fi'},
                {data: 'account_number'},
                {data: 'beneficiary_account_name'},
                {data: 'bank'},
                {data: 'reference_number'},
                {data: 'third_party_ref'},
                {data: 'token'},
                {data: 'balance_before'},
                {data: 'balance_after'},
                {data: 'transaction_type'},
                {data: 'transaction_date'},
                {data: 'created_at'},
                {data: 'is_reversed'},
				{data: 'Actions', responsivePriority: -1},
			],
			columnDefs: [
				{
					targets: -1,
					title: 'Actions',
					orderable: false,
					render: function(data, type, full, meta) {
					    var data = btoa(JSON.stringify(full))
						if (full.is_reversed || full.is_reversal) {
						    return `
                                <span class="dropdown">
                                    <a href="#" class="btn btn-sm btn-clean btn-icon btn-icon-md" data-toggle="dropdown" aria-expanded="true">
                                      <i class="la la-ellipsis-h"></i>
                                    </a>
                                    <div class="dropdown-menu dropdown-menu-right">
                                        <a class="dropdown-item" href="#"><i class="la la-arrow-up"></i>Update Status</a>
                                    </div>
                                </span>`;
						}else{
						    return `
                                <span class="dropdown">
                                    <a href="#" class="btn btn-sm btn-clean btn-icon btn-icon-md" data-toggle="dropdown" aria-expanded="true">
                                      <i class="la la-ellipsis-h"></i>
                                    </a>
                                    <div class="dropdown-menu dropdown-menu-right">
                                        <a class="dropdown-item" data-data=${data} id="reverseTransaction" href="#null"
                                        data-toggle='modal', data-target='#reverseModal'>
                                            <i class="la la-edit"></i>Reverse
                                        </a>
                                        <a class="dropdown-item" href="#"><i class="la la-leaf"></i>Update Status</a>
                                        <a class="dropdown-item" href="#"><i class="la la-print"></i>Generate Report</a>
                                    </div>
                                </span>
                                `;
						}

					},
				},
				{
					targets: -2,
					render: function(data, type, full, meta) {
						var status = {
							1: {'title': 'Successful', 'class': ' kt-badge--success'},
							2: {'title': 'Pending', 'class': ' kt-badge--warning'},
							3: {'title': 'Failed', 'class': ' kt-badge--danger'},
							4: {'title': 'Warning', 'class': 'kt-badge--brand'},
							5: {'title': 'Info', 'class': ' kt-badge--info'},
							6: {'title': 'Delivered', 'class': ' kt-badge--danger'},
							7: {'title': 'Canceled', 'class': ' kt-badge--primary'},
						};
						if (typeof status[data] === 'undefined') {
							return data;
						}
						return '<span class="kt-badge ' + status[data].class + ' kt-badge--inline kt-badge--pill">' + status[data].title + '</span>';
					},
				},
                {
                    targets: -3,
                    render: function(data, type, full, meta) {
                        return moment(data).format("dddd, MMMM Do YYYY, h:mm:ss a");
                    },
                },
                {
                    targets: -4,
                    render: function(data, type, full, meta) {
                        return moment(data).format("dddd, MMMM Do YYYY, h:mm:ss a");
                    },
                },
				{
					targets: -21,
					render: function(data, type, full, meta) {
						var status = {
							successful: {'title': 'Successful', 'class': ' kt-badge--success'},
							pending: {'title': 'Pending', 'class': ' kt-badge--warning'},
							failed: {'title': 'Failed', 'class': ' kt-badge--danger'},
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

	var destroyTable1 = function() {
		var table = $('#transactionsTable');
		table.DataTable().destroy();
	};

	return {

		//main function to initiate the module
		init: function(tableData) {
			initTable1(tableData);
		},
		destroy:function() {
			destroyTable1();
		},

	};

}();

$(document).ready(function() {
	const tableData = [];
	TransactionsTable.init(tableData);
	const formData = {}

    $.post(
        '/agent/get_transaction_options',
        {},
        function(response, status){
            const services = $.map( response.services, function(obj) {
              return {id:obj.id, text: obj.name};
            });
            const accounts = $.map( response.accounts, function(obj) {
              return {id:obj.id, text: obj.account_name};
            });
            const agents = $.map( response.agents, function(obj) {
              return {id:obj.id, text: obj.business_name};
            });
            services.unshift({id:'default', text:"-----Select Transaction Type-----"});
            $('#service').select2({
                  data: services
            });
            accounts.unshift({id:'default', text:"-----Select Account-----"});
            $('#account').select2({
                  data: accounts
            });
            agents.unshift({id:'default', text:"-----Select Agent-----"});
            $('#agent').select2({
                  data: agents
            });
        }
    );

    $('.input').on('change',function(e){
        formData[$(this).prop('name')] = $(this).val();
    });

    $('#tsqBtn').on('click', function(e){
        e.preventDefault();
        console.log(formData)
        if ('reference_number' in formData){
            $.ajax({
                url: '/agent/tsq',
                method: "post",
                data:formData,
                success: function(response, status, xhr, $form) {
                    console.log(response)
                    const newTableData = $.map( response.txn, function( elem, index ) {
                        elem.sn = index + 1;
                        if (elem.card_number){
                            elem.account_number = elem.card_number
                        }
                        if (elem.rrn){
                            elem.third_party_ref = elem.rrn
                        }
                        if (elem.is_reversed){
                            elem.is_reversed = 1;
                        }else{
                            elem.is_reversed = null;
                        }
                        return elem;
                    });
                    TransactionsTable.destroy();
                    TransactionsTable.init(newTableData);
                    if (response.status){
                        $('.modal-body').html(
                            `<ul class="list-group">
                            <li class="list-group-item"><h5 class="mb-1">Transaction Status</h5>${response.tsq.txn_status}</li>
                            <li class="list-group-item"><h5 class="mb-1">Reference Number</h5>${response.tsq.TxnId}</li>
                            <li class="list-group-item"><h5 class="mb-1">Amount</h5>${commaSeparator(response.tsq.amount)}</li>
                            <li class="list-group-item"><h5 class="mb-1">Session ID</h5>${response.tsq.sessionId}</li>
                        </ul>`
                        );
                    }else {
                        $('.modal-body').html('Transaction does not exist');
                    }

                    $('#tsqModal').modal('show')
                }
            });
        }

   });


    $('#searchBtn').on('click', function(e){
        e.preventDefault();
        console.log(formData)
        $.ajax({
            url: '/agent/search_transactions',
            method: "post",
            data:{"filter": JSON.stringify(formData)},
            success: function(response, status, xhr, $form) {
                console.log(response.data)
                const newTableData = $.map( response.data, function( elem, index ) {
                    elem.sn = index + 1;
                    if (elem.card_number){
                        elem.account_number = elem.card_number
                    }
                    if (elem.rrn){
                        elem.third_party_ref = elem.rrn
                    }
                    if (elem.is_reversed){
                        elem.is_reversed = 1;
                    }else{
                        elem.is_reversed = null;
                    }
                    return elem;
                });
                TransactionsTable.destroy();
                TransactionsTable.init(newTableData);
            }
        });
    });

	$.post(
        '/agent/get_transactions',
        {},
        function(response, status){
            const newTableData = $.map( response, function( elem, index ) {
              elem.sn = index + 1;
              if (elem.card_number){
                elem.account_number = elem.card_number
              }
              if (elem.rrn){
                elem.third_party_ref = elem.rrn
              }
              if (elem.is_reversed){
                elem.is_reversed = 1;
              }else{
                elem.is_reversed = null;
              }
              return elem;
            });
            TransactionsTable.destroy();
            TransactionsTable.init(newTableData);
        }
    );

    let txnData = {};
    let agentBalance = 0;
    let agentLien = 0;
    $('#reverseModal').on('show.bs.modal', function(e) {
        txnData = JSON.parse(atob($(e.relatedTarget).data('data')));
        $.ajax({
            async: false,
            url: '/agent/get_agent_balance',
            type: 'POST',
            dataType: 'json',
            data:{account_id: txnData.account__id},
            success:function(response) {
                if(response.status){
                    agentBalance = response.balance
                    agentLien = response.lien
                }
                else{
                    console.log('please try again');
                }
            }
        });
        $('.modal-body').html(
            `<ul class="list-group">
                <li class="list-group-item"><h5 class="mb-1">Account Name</h5>${txnData.account__account_name}</li>
                <li class="list-group-item"><h5 class="mb-1">Account Balance</h5>${commaSeparator(agentBalance.toString())}</li>
                <li class="list-group-item"><h5 class="mb-1">Account Lien</h5>${commaSeparator(agentLien.toString())}</li>
                <li class="list-group-item"><h5 class="mb-1">Reference Number</h5>${txnData.reference_number}</li>
                <li class="list-group-item"><h5 class="mb-1">Amount</h5>${commaSeparator(txnData.amount.toString())}</li>
                <li class="list-group-item"><h5 class="mb-1">RRN</h5>${txnData.rrn}</li>
                <li class="list-group-item"><h5 class="mb-1">Account Number</h5>${txnData.account_number}</li>
                <li class="list-group-item"><h5 class="mb-1">Transaction Status</h5>${txnData.status}</li>
            </ul>`
        );
    });

    $('#reverseTransactionBtn').on('click', function(e){
        if (txnData.transaction_description === 'funding'){
            console.log(txnData);
            $.ajax({
                url: '/agent/fund_account',
                type: 'POST',
                dataType: 'json',
                data:{account_id: txnData.account__id, amount: txnData.amount, reversal:true, reference_number:txnData.reference_number},
                beforeSend : function() {
                        $(this).addClass('kt-spinner kt-spinner--v2 kt-spinner--sm kt-spinner--success kt-spinner--right kt-spinner--input');
                },

                success:function(response) {
                        if(response.status){
                            $('#reverseModal').modal('hide');
                            $.notify({
                                // options
                                icon: 'glyphicon glyphicon-warning-sign',
                                title: '',
                                message: 'Transaction has been reversed successfully',
                            });
                        }
                        else{
                            $('#reverseModal').modal('hide');
                            $.notify(
                                {
                                    // options
                                    icon: 'glyphicon glyphicon-warning-sign',
                                    title: '',
                                    message: 'Transaction Reversal unsuccessfully',
                                },
                                {
                                    type:'danger'
                                }
                            );
                            console.log('please try again');
                        }
                        $(this).removeClass('kt-spinner kt-spinner--v2 kt-spinner--sm kt-spinner--success kt-spinner--right kt-spinner--input');
                }
            });

        }

        if (txnData.transaction_description === 'deduction'){
            const details = {account_id: txnData.account__id, amount: txnData.amount}
            $.ajax({
                url: '/agent/deduct_account',
                type: 'POST',
                dataType: 'json',
                data:{details: JSON.stringify(details), reversal:true, reference_number:txnData.reference_number},
                beforeSend : function() {
                    $(this).addClass('kt-spinner kt-spinner--v2 kt-spinner--sm kt-spinner--success kt-spinner--right kt-spinner--input');
                },

                success:function(response) {
                    if(response.status){
                        $('#reverseModal').modal('hide');
                        $.notify({
                            // options
                            icon: 'glyphicon glyphicon-warning-sign',
                            title: '',
                            message: 'Transaction has been reversed successfully',
                        });
                    }
                    else{
                        $('#reverseModal').modal('hide');
                        $.notify(
                            {
                                // options
                                icon: 'glyphicon glyphicon-warning-sign',
                                title: '',
                                message: 'Transaction Reversal unsuccessfully',
                            },
                            {
                                type:'danger'
                            }
                        );
                        console.log('please try again');
                    }
                    $(this).removeClass('kt-spinner kt-spinner--v2 kt-spinner--sm kt-spinner--success kt-spinner--right kt-spinner--input');
                }
            });

        }

        if (txnData.transaction_description === 'pos withdrawal'){
            var reversalData = {
                amount: txnData.amount * 100,
                statusCode: '00',
                reversal: 'true',
                terminalId: txnData.terminal_id,
                RRN: txnData.rrn,
                pan: txnData.card_number,
                fi: txnData.fi,
            };
            console.log(reversalData);

            $.ajax({
                url: '/agent/notification',
                type: 'POST',
                //dataType: 'json',
                data:reversalData,
                beforeSend : function() {
                        $(this).addClass('kt-spinner kt-spinner--v2 kt-spinner--sm kt-spinner--success kt-spinner--right kt-spinner--input');
                },
                success:function(response) {
                        console.log(response)
                        if(response.status){
                            $('#reverseModal').modal('hide');
                            $.notify({
                                // options
                                icon: 'glyphicon glyphicon-warning-sign',
                                title: '',
                                message: 'Transaction has been reversed successfully',
                            });
                        }
                        else{
                            $('#reverseModal').modal('hide');
                            $.notify(
                                {
                                    // options
                                    icon: 'glyphicon glyphicon-warning-sign',
                                    title: '',
                                    message: response.message +' '+ response.terminal_id,
                                },
                                {
                                    type:'danger'
                                }
                            );
                            console.log('please try again');
                        }
                        $(this).removeClass('kt-spinner kt-spinner--v2 kt-spinner--sm kt-spinner--success kt-spinner--right kt-spinner--input');
                }
            });

        }

        if (txnData.transaction_description === 'bank transfer'){
//            var reversalData = {
//                amount: txnData.amount * 100,
//                statusCode: '00',
//                reversal: 'true',
//                terminalId: txnData.terminal_id,
//                RRN: txnData.rrn,
//                pan: txnData.card_number,
//                fi: txnData.fi,
//            };
            console.log(reversalData);
            console.log(txnData);

            $.ajax({
                url: '/agent/reverse_bank_transfer',
                type: 'POST',
                //dataType: 'json',
                data:txnData,
                beforeSend : function() {
                        $(this).addClass('kt-spinner kt-spinner--v2 kt-spinner--sm kt-spinner--success kt-spinner--right kt-spinner--input');
                },
                success:function(response) {
                        console.log(response)
                        if(response.status){
                            $('#reverseModal').modal('hide');
                            $.notify({
                                // options
                                icon: 'glyphicon glyphicon-warning-sign',
                                title: '',
                                message: 'Transaction has been reversed successfully',
                            });
                        }
                        else{
                            $('#reverseModal').modal('hide');
                            $.notify(
                                {
                                    // options
                                    icon: 'glyphicon glyphicon-warning-sign',
                                    title: '',
                                    message: response.message
                                },
                                {
                                    type:'danger'
                                }
                            );
                            console.log('please try again');
                        }
                        $(this).removeClass('kt-spinner kt-spinner--v2 kt-spinner--sm kt-spinner--success kt-spinner--right kt-spinner--input');
                }
            });

        }

    });

    $('#lienBtn').on('click', function(e){
        if (!txnData.is_lien){
            $.ajax({
                url: '/agent/lien_account',
                type: 'POST',
                dataType: 'json',
                data:{account_id: txnData.account__id, amount: txnData.amount, reference_number: txnData.reference_number},
                beforeSend : function() {
                    $('#confirmFund').addClass('kt-spinner kt-spinner--v2 kt-spinner--sm kt-spinner--success kt-spinner--right kt-spinner--input');
                },
                success:function(response) {
                    if(response.status){
                        $('#reverseModal').modal('hide')
                    }
                    else{
                        console.log('please try again');
                    }
                    $('#confirmLien').removeClass('kt-spinner kt-spinner--v2 kt-spinner--sm kt-spinner--success kt-spinner--right kt-spinner--input');
                }
            });
        }else{
            alert('A Lien has been placed on this transaction already');
        }
    });
});