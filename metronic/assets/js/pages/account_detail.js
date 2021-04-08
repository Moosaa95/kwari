var TerminalTable = function(accountId) {
	var initTable1 = function(accountId) {
		var table = $('#terminalsTable');
		// begin first table
		table.DataTable({
			responsive: true,
			searchDelay: 500,
//			processing: true,
//			serverSide: true,
			ajax: {
			    url:'account_detail',
			    type:'POST',
			    data:{'get_terminals':true, 'account_id':accountId},
			    dataSrc: ''
				},

			columns: [
				{data: 'sn'},
				{data: 'terminal_id'},
				{data: 'terminal_name'},
				{data: 'bank'},
				{data: 'ptsp'},
				{data: 'ltd'},
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
                        <a href="#null" class="btn btn-sm btn-clean btn-icon btn-icon-md" title="Generate Report">
                          <i class="la la-print"></i>
                        </a>
                        <a href="#null" id="unassignTerminal" data-terminal="${full.terminal_id}" class="btn btn-sm btn-clean btn-icon btn-icon-md" title="unassign">
                          <i class="la la-trash"></i>
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

	var refreshTable1 = function() {
		var table = $('#terminalsTable');
		// begin first table
		table.DataTable().ajax.reload();
	};

	return {

		//main function to initiate the module
		init: function(accountId) {
			initTable1(accountId);
		},
		refresh:function() {
			refreshTable1();
		},

	};

}();

var StructureTable = function(accountId) {
	var initTable1 = function(accountId) {
		var table = $('#commissionStructureTable');
		// begin first table
		table.DataTable({
			responsive: true,
			searchDelay: 500,
			ajax: {
			    url:'account_detail',
			    type:'POST',
			    data:{'get_structures':true, 'account_id':accountId},
			    dataSrc: ''
				},

			columns: [
				{data: 'sn'},
				{data: 'service'},
				{data: 'name'},
				{data: 'code'},
				{data: 'type'},
				{data: 'description'},
				{data: 'Actions', responsivePriority: -1},
			],
			columnDefs: [
				{
					targets: -1,
					title: 'Actions',
					orderable: false,
					render: function(data, type, full, meta) {
						return `
                        <a href="#null" class="btn btn-sm btn-clean btn-icon btn-icon-md" title="View">
                          <i class="la la-eye"></i>
                        </a>
                        <a href="#null" id="unassignStructure" data-code="${full.code}" class="btn btn-sm btn-clean btn-icon btn-icon-md" title="remove">
                          <i class="la la-trash"></i>
                        </a>`;
					},
				},
			],
		});
	};

	var refreshTable1 = function() {
		var table = $('#commissionStructureTable');
		// begin first table
		table.DataTable().ajax.reload();
	};

	return {

		//main function to initiate the module
		init: function(accountId) {
			initTable1(accountId);
		},
		refresh:function() {
			refreshTable1();
		},

	};

}();

$(document).ready(function(){
    const accountId = JSON.parse($('#userData').text());
    const accountNumber = JSON.parse($('#accountNum').text());
    var terminalId = '';
    var structureId = '';
    let structureCode = '';
    var chargeType = '';
    var stampDuty = '';
    const activeClass = "btn btn-success btn-md";
    const inactiveClass = "btn btn-danger btn-md"
    const statusBtn = $('#statusBtn');
    const resetPasswordBtn = $('#resetPasswordBtn');
    const deductAccountContent = $('#deductAccountContent');
    let deductionDetails = {};
    let editDetails = {};
    let agentEditDetails = {};
    const deductionHeaders = ['amount','rrn','terminal_id','card_number','third_party_ref','beneficiary_account_name','account_number', 'bank','fi','remarks'];

    let status = $('#accountStatus').text();
    status = status === 'True' ? true : false
    if (!status){
        statusBtn.removeClass(activeClass);
        statusBtn.addClass(inactiveClass);
        statusBtn.text('inactive')
    }

    statusBtn.on('click', function(e){
        alert("Are you sure you want to change the agent status?")
        $.ajax({
            url: '/agent/set_agent_status',
            type: 'POST',
            dataType: 'json',
            data: {'account_id':accountId},
            beforeSend : function() {
                statusBtn.addClass('kt-spinner kt-spinner--v2 kt-spinner--sm kt-spinner--success kt-spinner--right kt-spinner--input');
            },
            success:function(response) {
                setTimeout(function(){
                    if (response.status){
                        if (response.account_status){
                            statusBtn.removeClass(inactiveClass);
                            statusBtn.addClass(activeClass);
                            statusBtn.text('active');
                        }else {
                            statusBtn.removeClass(activeClass);
                            statusBtn.addClass(inactiveClass);
                            statusBtn.text('inactive');
                        }
                    }
                    else{
                        console.log('try again');
                    }
                    statusBtn.removeClass('kt-spinner kt-spinner--v2 kt-spinner--sm kt-spinner--success kt-spinner--right kt-spinner--input');
                }, 2000);
            }
        });

    });


    resetPasswordBtn.on('click', function(e){
        alert("Are you sure you want to reset the account password?")
        $.ajax({
            url: '/agent/reset_password',
            type: 'POST',
            dataType: 'json',
            data: {'username': accountNumber},
            beforeSend : function() {
                statusBtn.addClass('kt-spinner kt-spinner--v2 kt-spinner--sm kt-spinner--success kt-spinner--right kt-spinner--input');
            },
            success:function(response) {
                setTimeout(function(){
                    if (response.status){
                        $('#alertMessage').html(
                            `<div class="alert alert-success alert-dismissible show" role="alert">
                                <span>${response.pin}</span>
                                <button type="button" class="close" data-dismiss="alert" aria-label="Close">
                                    <span aria-hidden="true">&times;</span>
                                </button>
                            </div>`
                        );
                    }
                    else{
                        console.log('try again');
                    }
                    statusBtn.removeClass('kt-spinner kt-spinner--v2 kt-spinner--sm kt-spinner--success kt-spinner--right kt-spinner--input');
                }, 2000);
            }
        });

    });

    //terminal management
    TerminalTable.init(accountId);

    $('#assignTerminal').on('show.bs.modal', function(e) {
        $.post(
            '/agent/get_unassigned_terminals',
            {},
            function(response, status){
                var terminals = $.map( response.results, function(obj) {
                  return {id:obj.terminal_id, text: obj.terminal_id};
                });
                terminals.unshift({id:'default', text:"-----Select a Terminal-----"});
                $('#terminal').select2({
                      data: terminals
                });
            }
        );
    });

    $('#terminal').on('change', function() {
      terminalId = $(this).val();
    });

    $('#assign').on('click', function(e){
        $.ajax({
            url: '/agent/assign_terminal',
            type: 'POST',
            dataType: 'json',
            data: {'terminal_id':terminalId, 'account_id':accountId},
            beforeSend : function() {
                         $('#assign').addClass('kt-spinner kt-spinner--v2 kt-spinner--sm kt-spinner--success kt-spinner--right kt-spinner--input');
                        },
            success:function(response) {
                setTimeout(function(){
                    if (response.result){
                        $('#assignTerminal').modal('hide');
                        TerminalTable.refresh();
                    }
                    else{
                        console.log('try again');
                       $('#assign').removeClass('kt-spinner kt-spinner--v2 kt-spinner--sm kt-spinner--success kt-spinner--right kt-spinner--input');
                    }

                }, 2000);
            }
        });

    });

    $('#terminalsTable').on('click', '#unassignTerminal', function(e){
        e.preventDefault();
        var terminal = $('#unassignTerminal').data("terminal");
        $.ajax({
            url: '/agent/unassign_terminal',
            type: 'POST',
            dataType: 'json',
            data: {'terminal_id': terminal},
            success:function(response) {
                    if (response.result){
                        TerminalTable.refresh();
                    }
                    else{
                        console.log('try again');
                    }
            }
        });
    });

    // Account funding
    $('#fund').on('click', function(e){
        var accountName = $('#accountName').text()  //$('#fundMerchant').find('input[name="merchantName"]').val();
        var amount = $('#fundingAmountInput').val();
        $('#fundAccountModal').modal('hide');
        $('#confirmFundAccount').on('show.bs.modal', function(e) {
            $('#confirmAccountName').text(accountName);
            $('#fundingAmount').text(commaSeparator(amount));
        });   //  pass the data to the modal
        $('#confirmFundAccount').modal('show'); // show the modal
    });

    $('#confirmFund').on('click', function(e){
        var amount = removeCommas($('#fundingAmount').text());
        $.ajax({
                url: '/agent/fund_account',
                type: 'POST',
                dataType: 'json',
                data:{account_id: accountId, amount: amount},
                beforeSend : function() {
                        $('#confirmFund').addClass('kt-spinner kt-spinner--v2 kt-spinner--sm kt-spinner--success kt-spinner--right kt-spinner--input');
                },

                success:function(response) {
                        if(response.status){
                            $('#confirmFundAccount').modal('hide');
                            $('#accountBalance').text(commaSeparator(response.new_balance.toString()));
                        }
                        else{
                            console.log('please try again');
                        }
                        $('#confirmFund').removeClass('kt-spinner kt-spinner--v2 kt-spinner--sm kt-spinner--success kt-spinner--right kt-spinner--input');
                }
        });

    });

    $('#deductAccountModal').on('show.bs.modal',function (e){
        deductAccountContent.empty();
        $.each(deductionHeaders, function( index, value ) {
            deductAccountContent.append(
                `<div class="form-group">
                    <label for="${value}" class="form-control-label">${value}</label>
                    <input name="${value}" class="form-control deductInput" id="${value}">
                </div>`
            );
        });


        $('.deductInput').on('change',function(e){
            deductionDetails[$(this).prop('name')] = $(this).val();
            console.log(deductionDetails)
        });

    });

    $('#deduct').on('click', function(e){
        deductionDetails['account_id'] = accountId
        $.ajax({
            url: '/agent/deduct_account',
            type: 'POST',
            dataType: 'json',
            data:{details: JSON.stringify(deductionDetails)},
            beforeSend : function() {
                $('#confirmFund').addClass('kt-spinner kt-spinner--v2 kt-spinner--sm kt-spinner--success kt-spinner--right kt-spinner--input');
            },

            success:function(response) {
                if(response.status){
                    $('#deductAccountModal').modal('hide');
                    $('#accountBalance').text(commaSeparator(response.new_balance.toString()));
                }
                else{
                    console.log('please try again');
                }
                $('#confirmFund').removeClass('kt-spinner kt-spinner--v2 kt-spinner--sm kt-spinner--success kt-spinner--right kt-spinner--input');
            }
        });

    });

    // Lien Account
    $('#lien').on('click', function(e){
        const accountName = $('#accountName').text()  //$('#fundMerchant').find('input[name="merchantName"]').val();
        const amount = $('#lienAmountInput').val();
        const confirmLienAccount = $('#confirmLienAccount')
        $('#lienAccountModal').modal('hide');
        confirmLienAccount.on('show.bs.modal', function(e) {
            $('#confirmLienAccountName').text(accountName);
            $('#lienAmount').text(commaSeparator(amount));
        });   //  pass the data to the modal
        confirmLienAccount.modal('show'); // show the modal
    });

    $('#confirmLien').on('click', function(e){
        const amount = removeCommas($('#lienAmount').text());
        $.ajax({
            url: '/agent/lien_account',
            type: 'POST',
            dataType: 'json',
            data:{account_id: accountId, amount: amount},
            beforeSend : function() {
                $('#confirmFund').addClass('kt-spinner kt-spinner--v2 kt-spinner--sm kt-spinner--success kt-spinner--right kt-spinner--input');
            },

            success:function(response) {
                if(response.status){
                    $('#confirmLienAccount').modal('hide');
                    $('#lienBalance').text(commaSeparator(response.lien.toString()));
                }
                else{
                    console.log('please try again');
                }
                $('#confirmLien').removeClass('kt-spinner kt-spinner--v2 kt-spinner--sm kt-spinner--success kt-spinner--right kt-spinner--input');
            }
        });

    });

    $('#resetLien').on('click', function(e){
        const amount = removeCommas($('#lienAmount').text());
        $.ajax({
            url: '/agent/lien_account',
            type: 'POST',
            dataType: 'json',
            data:{account_id: accountId, amount: 0, reset: true},
            beforeSend : function() {
                $('#confirmFund').addClass('kt-spinner kt-spinner--v2 kt-spinner--sm kt-spinner--success kt-spinner--right kt-spinner--input');
            },

            success:function(response) {
                if(response.status){
                    $('#lienBalance').text(commaSeparator(response.lien.toString()));
                }
                else{
                    console.log('please try again');
                }
                $('#resetLien').removeClass('kt-spinner kt-spinner--v2 kt-spinner--sm kt-spinner--success kt-spinner--right kt-spinner--input');
            }
        });

    });

    $('#editBtn').on('click', function(e){
        $('#editAccountModal').modal('show');
    });

    $('#editAccountModal').on('show.bs.modal', function(e) {
        const editAccountContent = $('#editAccountContent')
        $.get(
            '/agent/edit_account',
            {account_id: accountId},
            function(response, status){
                console.log(response)
                editAccountContent.empty()
                if (response.agent_details){
                    $.each(response.agent_details, function( key, value ) {
                        $('#editAccountContent').append(
                            `<div class="form-group">
                                <label for="${key}" class="form-control-label">${key}</label>
                                <div class="input-group">
                                    <div class="input-group-prepend">
                                        <span class="input-group-text"></span>
                                    </div>
                                    <input type="text" class="form-control agent-input addComma" name=${key} value="${value}"/>
                                </div>
                            </div>`
                        )
                    });
                }
                $.each(response.account_details, function( key, value ) {
                    $('#editAccountContent').append(
                        `<div class="form-group">
                            <label for="${key}" class="form-control-label">${key}</label>
                            <div class="input-group">
                                <div class="input-group-prepend">
                                    <span class="input-group-text"></span>
                                </div>
                                <input type="text" class="form-control form-input addComma" name=${key} value="${value}"/>
                            </div>
                        </div>`)
                })

                $('.form-input').on('change',function(e){
                    editDetails[$(this).prop('name')] = $(this).val();
                    console.log(editDetails)
                });

                $('.agent-input').on('change',function(e){
                    agentEditDetails[$(this).prop('name')] = $(this).val();
                    console.log(agentEditDetails)
                });
            }
        );
    });

    $('#saveEdits').on('click', function(e){
        e.preventDefault();
        $.ajax({
            url: '/agent/edit_account',
            type: 'POST',
            dataType: 'json',
            data: {edits: JSON.stringify(editDetails), agent_edits: JSON.stringify(agentEditDetails), account_id: accountId},
            success:function(response) {
                console.log(response)
                if (response.status){
                    $('#editAccountModal').modal('hide');
                }
                else{
                    alert('you can not unassign structure.');
                }
            }
        });
    });

    //structure management
    StructureTable.init(accountId);

    $('#assignStructureModal').on('show.bs.modal', function(e) {
        var chargeTypes = [
            {id:'default', text: '-----select structure type-----'},
            {id:'fixed', text: 'Fixed'},
            {id:'percentage', text: 'Percentage'},
        ]

        $("#stampDuty").prop('checked',false);

        $('#chargeType').select2({
              data: chargeTypes
        });

        $.post(
            '/agent/get_structures',
            {},
            function(response, status){
                var structures = $.map( response, function(obj) {
                  return {id:obj.code, text: obj.name};
                });
                structures.unshift({id:'default', text:"-----Select a Structure-----"});
                $('#structure').select2({
                      data: structures
                });
            }
        );
    });

    $('#structure').on('change', function() {
      structureCode = $(this).val();
      console.log(structureCode);
    });

    $('#chargeType').on('change', function() {
      chargeType = $(this).val();
      console.log(chargeType);
    });

    $('#stampDuty').on('change',function(){
        stampDuty =  $(this).prop('checked');
        console.log(stampDuty);
    });

    $('#assignStructureBtn').on('click', function(e){
        console.log(stampDuty);
        $.ajax({
            url: '/agent/assign_structure',
            type: 'POST',
            dataType: 'json',
            data: {'structure_code':structureCode, 'account_id':accountId, 'charge_type':chargeType, 'stamp_duty':stampDuty},
            beforeSend : function() {
                         $('#assignStructureBtn').addClass('kt-spinner kt-spinner--v2 kt-spinner--sm kt-spinner--success kt-spinner--right kt-spinner--input');
                        },
            success:function(response) {
                setTimeout(function(){
                    if (response.result){
                        $('#assignStructureModal').modal('hide');
                        StructureTable.refresh();
                    }
                    else{
                        console.log('try again');
                       $('#assignStructureBtn').removeClass('kt-spinner kt-spinner--v2 kt-spinner--sm kt-spinner--success kt-spinner--right kt-spinner--input');
                    }

                }, 2000);
            }
        });

    });

    $(document).on('click', '#unassignStructure', function(e){
        e.preventDefault();
        const code = $(e.target).data('code');
        $.ajax({
            url: '/agent/unassign_structure',
            type: 'POST',
            dataType: 'json',
            data: {structure_code: code, account_id: accountId},
            success:function(response) {
                if (response.result){
                    StructureTable.refresh();
                }
                else{
                    alert('you can not unassign structure.');
                }
            }
        });
    });


});
