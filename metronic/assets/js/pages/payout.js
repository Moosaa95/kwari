"use strict";
const PayOutsTable = function(tableData) {
    const table = $('#payOutsTable');
	const initTable1 = function(tableData) {
		// begin first table
		table.DataTable({
			responsive: true,
			searchDelay: 500,
            data:tableData,

			columns: [
				{data: 'sn'},
                {data: 'account__account_name'},
                {data: 'account__agent__business_name'},
                {data: 'commission'},
				{data: 'Actions', responsivePriority: -1},
			],
			columnDefs: [
				{
					targets: -1,
					title: 'Actions',
					orderable: false,
					render: function(data, type, full, meta) {
					    const paydata = btoa(JSON.stringify(full))
						return (`
                            <a href="#null" class="btn btn-sm btn-clean btn-icon btn-icon-md paySingleAgent" data-paydata="${paydata}" title="PAY">
                              <i class="la la-money"></i>
                            </a>`
                        );
					},
				},
			],
		});
	};

	const destroyTable1 = function() {
		table.DataTable().destroy();
	};

    const selectedRows = function() {
        //const rowsData = table.DataTable().rows({selected: true});
        return table.DataTable().rows({selected: true}).data();
        // return table.DataTable().rows().data();
    };

	return {

		//main function to initiate the module
		init: function(tableData) {
			initTable1(tableData);
		},
		destroy:function() {
			destroyTable1();
		},

        rowsData:function() {
            return selectedRows();
        },

	};

}();

$(document).ready(function() {
	var tableData = [];
	let selectedRowsData = [];
	var month = null;
	var year = null;
	PayOutsTable.init(tableData);
	var formData = {}

    $('.input').on('change',function(e){
        formData[$(this).prop('name')] = $(this).val();
    });

    $('#searchBtn').on('click', function(e){
        e.preventDefault();
        $.ajax({
            url: '/agent/search_transactions',
            method: "post",
            data:{"filter": JSON.stringify(formData)},
            success: function(response, status, xhr, $form) {
                console.log(response);
                var newTableData = $.map( response.data, function( elem, index ) {
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
        '/agent/get_payout',
        {},
        function(response, status){
            const newTableData = $.map( response.record, function( elem, index ) {
              elem.sn = index + 1;
              return elem;
            });
            PayOutsTable.destroy();
            PayOutsTable.init(newTableData);
            tableData = newTableData;
            month = response.month;
            year = response.year;
        }
    );

    $('#payOutsTable tbody').on( 'click', 'tr', function () {
        $(this).toggleClass('selected');
        selectedRowsData = PayOutsTable.rowsData()
        console.log(selectedRowsData)
    } );

    $('#payAgents').on('click', function(e){
        e.preventDefault();
        console.log('tttttttttttttttttttttttttttttt')
        console.log(month)
        console.log(year)
        if (tableData.length > 0){
            $.ajax({
            url: '/agent/pay_agent',
            type: 'POST',
            dataType: 'json',
            data: {data: JSON.stringify(tableData), month: month, year: year},
            beforeSend : function() {
                     $(this).addClass('kt-spinner kt-spinner--v2 kt-spinner--sm kt-spinner--success kt-spinner--right kt-spinner--input');
                    },
            success: function(response, status, xhr, $form) {
                if (response) {
                   console.log(response)
                }
                else{
                    console.log("please try again")
                }
                $(this).removeClass('kt-spinner kt-spinner--v2 kt-spinner--sm kt-spinner--success kt-spinner--right kt-spinner--input');
            }
        });
        }
    });

    $(document).on('click', '.paySingleAgent' ,function(e){
        e.preventDefault();
        let payData = $(e.currentTarget).data('paydata')
        payData = JSON.parse(atob(payData));

        $.ajax({
            url: '/agent/pay_agent',
            type: 'POST',
            dataType: 'json',
            data: {data: JSON.stringify(payData), month: month, year: year},
            beforeSend : function() {
                $(this).addClass('kt-spinner kt-spinner--v2 kt-spinner--sm kt-spinner--success kt-spinner--right kt-spinner--input');
            },
            success: function(response, status, xhr, $form) {
                if (response.status) {
                    console.log(response)
                    $.notify({
                        // options
                        icon: 'fa fa-checked',
                        title: '',
                        message: response.message,
                    });
                    $.post(
                        '/agent/get_payout',
                        {},
                        function(response, status){
                            const newTableData = $.map( response.record, function( elem, index ) {
                                elem.sn = index + 1;
                                return elem;
                            });
                            PayOutsTable.destroy();
                            PayOutsTable.init(newTableData);
                            tableData = newTableData;
                            month = response.month;
                            year = response.year;
                        }
                    );
                }
                else{
                    console.log("please try again")
                    $.notify(
                        {
                            // options
                            icon: 'glyphicon glyphicon-warning-sign',
                            title: '',
                            message: response.message,
                        },
                        {
                            type:'danger'
                        }
                    );
                }
                $(this).removeClass('kt-spinner kt-spinner--v2 kt-spinner--sm kt-spinner--success kt-spinner--right kt-spinner--input');
            }
        });
    });


});