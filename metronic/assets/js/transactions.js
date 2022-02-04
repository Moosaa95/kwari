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
                {data: 'product__name'},
                {data: 'price'},
                {data: 'quantity'},
                {data: 'amount'},
                {data: 'account_number'},
                {data: 'shipping_address'},
                {data: 'mobile_number'},
                {data: 'reference_number'},
                {data: 'amount_paid'},
                {data: 'sender_account'},
                {data: 'sender_name'},
                {data: 'stock_before'},
                {data: 'stock_after'},
                {data: 'transaction_type'},
                {data: 'transaction_date'},
                {data: 'remarks'},
                {data: 'is_refund'},
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
                                        <a class="dropdown-item" href="#"><i class="la la-leaf"></i>Update Status</a>
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
                    targets: -4,
                    render: function(data, type, full, meta) {
                        return moment(data).format("dddd, MMMM Do YYYY, h:mm:ss a");
                    },
                },

				{
					targets: -19,
					render: function(data, type, full, meta) {
						const status = {
							paid: {'title': 'Successful', 'class': ' kt-badge--success'},
							pending: {'title': 'Pending', 'class': ' kt-badge--warning'},
							failed: {'title': 'Failed', 'class': ' kt-badge--danger'},
                            packaged: {'title': 'Warning', 'class': 'kt-badge--brand'},
							collected: {'title': 'Info', 'class': ' kt-badge--info'},
							// 6: {'title': 'Delivered', 'class': ' kt-badge--danger'},
							// 7: {'title': 'Canceled', 'class': ' kt-badge--primary'},
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

    // $.post(
    //     '/app/get_transaction_options',
    //     {},
    //     function(response, status){
    //         const services = $.map( response.services, function(obj) {
    //           return {id:obj.id, text: obj.name};
    //         });
    //         const accounts = $.map( response.accounts, function(obj) {
    //           return {id:obj.id, text: obj.account_name};
    //         });
    //         const agents = $.map( response.agents, function(obj) {
    //           return {id:obj.id, text: obj.business_name};
    //         });
    //         services.unshift({id:'default', text:"-----Select Transaction Type-----"});
    //         $('#service').select2({
    //               data: services
    //         });
    //         accounts.unshift({id:'default', text:"-----Select Account-----"});
    //         $('#account').select2({
    //               data: accounts
    //         });
    //         agents.unshift({id:'default', text:"-----Select Agent-----"});
    //         $('#agent').select2({
    //               data: agents
    //         });
    //     }
    // );

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
        '/app/get_transactions',
        {count:100},
        function(response, status){
            console.log("===================")
            console.log(response)
            const newTableData = $.map( response, function( elem, index ) {
              elem.sn = index + 1;

              if (elem.is_refund){
                elem.is_refund = 1;
              }else{
                elem.is_refund = null;
              }
              return elem;
            });
            TransactionsTable.destroy();
            TransactionsTable.init(newTableData);
        }
    );

});