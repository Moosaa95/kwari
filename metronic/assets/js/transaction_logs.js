var TransactionsTable = function(data) {

	var initTable1 = function(data) {
		var table = $('#transactionLogsTable');

		// begin first table
		table.DataTable({
			responsive: true,
			destroy: true,
			searchDelay: 500,
//			processing: true,
//			serverSide: true,
			data: data,

//			ajax: {
//			    url:'transaction_logs',
//			    type:'POST',
//			    dataSrc: ''
//				},

		});
	};

	return {

		//main function to initiate the module
		init: function(data) {
			initTable1(data);
		},

	};

}();

$(document).ready(function(){

    $('#logSearch').click(function(e) {
        e.preventDefault();
        var terminal = $('#terminal').val()
        var rrn = $('#rrn').val()
        if (terminal || rrn){
            var data = {search:true};
            var form = document.getElementById("searchForm");
            var formData = new FormData(form);

            for(var pair of formData.entries()) {
               if (pair[1].length > 0){
                data[pair[0]] = pair[1];
               }
            }
            $.ajax({
                url: 'transaction_logs',
                type: 'POST',
                //dataType: 'json',
                data: data, //{terminal: terminal, rrn: rrn, search: true},
                //processData: false,
                //contentType: false,
                beforeSend : function() {
                             $('#logSearch').addClass('kt-spinner kt-spinner--v2 kt-spinner--sm kt-spinner--success kt-spinner--right kt-spinner--input');
                            },
                success:function(data) {
                    setTimeout(function()
                        {
                           $('#logSearch').removeClass('kt-spinner kt-spinner--v2 kt-spinner--sm kt-spinner--success kt-spinner--right kt-spinner--input');
                           $('#notifications').text(data.notifications);
                           $('#approvedTransactions').text(data.approved_transactions);
                           $('#approvedAmount').text(data.approved_amount);
                           table = TransactionsTable.init(data.logs);
                        }, 2000);

                }
            });
        }

    });

});