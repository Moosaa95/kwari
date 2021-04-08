"use strict";
const ReportsTable = function (tableData) {

    var initTable1 = function (tableData) {
        var table = $('#reportsTable');

        // begin first table
        table.DataTable({
            responsive: true,
            searchDelay: 500,
            data: tableData,

            columns: [
                {data: 'sn'},
                {data: 'name'},
                {data: 'date'},
                {data: 'status'},
                {data: 'Actions', responsivePriority: -1},
            ],
            columnDefs: [
                {
                    targets: -1,
                    title: 'Actions',
                    orderable: false,
                    render: function (data,type, full, meta) {
                        var data = btoa(JSON.stringify(full.data))
                        return `
                            <a href="#null" id="exportExcel" data-report=${data} class="btn btn-sm btn-clean btn-icon btn-icon-md" title="Export">
                              <i class="la la-print"></i>
                            </a>`;
                    },
                },
                {
                    targets: -2,
                    render: function (data, type, full, meta) {
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
            ],
        });
    };

    var destroyTable1 = function () {
        var table = $('#reportsTable');
        table.DataTable().destroy();
    };

    return {

        //main function to initiate the module
        init: function (tableData) {
            initTable1(tableData);
        },
        destroy: function () {
            destroyTable1();
        },

    };

}();

const CompanyTransactionTable = function(tableData) {

    var initTable1 = function(tableData) {
        var table = $('#companyTransactionTable');

        // begin first table
        table.DataTable({
            responsive: true,
            searchDelay: 500,
            data:tableData,

            columns: [
                //{data: 'sn'},
                {data: 'terminal_id'},
                {data: 'rrn'},
                {data: 'amount'},
                {data: 'Actions', responsivePriority: -1},
            ],
            columnDefs: [
                {
                    targets: -1,
                    title: 'Actions',
                    orderable: false,
                    render: function(data, type, full, meta) {
                        var data = btoa(JSON.stringify(full.data))
                        return `
                            <a href="#null" id="exportExcel" data-report=${data} class="btn btn-sm btn-clean btn-icon btn-icon-md" title="Export">
                              <i class="la la-print"></i>
                            </a>`;
                    },
                },
            ],
        });
    };

    var destroyTable1 = function() {
        var table = $('#companyTransactionTable');
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

const BankTransactionTable = function(tableData) {

    var initTable1 = function(tableData) {
        var table = $('#bankTransactionTable');

        // begin first table
        table.DataTable({
            responsive: true,
            searchDelay: 500,
            data:tableData,

            columns: [
                //{data: 'sn'},
                {data: 'terminal_id'},
                {data: 'rrn'},
                {data: 'amount'},
                {data: 'Actions', responsivePriority: -1},
            ],
            columnDefs: [
                {
                    targets: -1,
                    title: 'Actions',
                    orderable: false,
                    render: function(data, type, full, meta) {
                        return `
                            <a href="#null" id="#"  class="btn btn-sm btn-clean btn-icon btn-icon-md" title="Export">
                              <i class="la la-print"></i>
                            </a>`;
                    },
                },
            ],
        });
    };

    var destroyTable1 = function() {
        var table = $('#bankTransactionTable');
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
    ReportsTable.init(tableData);
	const formData = {};
    const reportHeaders = {"created_at": "Date", "account__account_name": "Account Name", "account__account_number": "Account Number",
        "account__agent__business_name":"Business Name", "account_number":"Card/Account Number",
        "card_number":"Card/Account Number", "transaction_description": "Transaction Type", "fi":"Service Provider" ,
        "bank": "Bank", "beneficiary_account_name":"Beneficiary Name", "amount":"Amount", "balance_after": "Balance",
        "charges": "Fees", "terminal_id": "Terminal ID", "rrn": "RRN/3rd-Ref", "third_party_ref": "RRN/3rd-Ref",
        "status": "Status", "reference_number": "Reference Number", "bank_charges": "Bank Charges",
        "agent_commission": "Agent Commission", "company_commission": "Company Commission",
        "transaction_type": "Credit/Debit"
    }

    $.post(
        '/agent/get_transaction_options',
        {},
        function(response, status){
            var services = $.map( response.services, function(obj) {
              return {id:obj.id, text: obj.name};
            });
            var accounts = $.map( response.accounts, function(obj) {
              return {id:obj.id, text: obj.account_name};
            });
            var agents = $.map( response.agents, function(obj) {
              return {id:obj.id, text: obj.business_name};
            });
            services.unshift({id:'default', text:"-----Select Transaction Type-----"});
            $('.service').select2({
                  data: services
            });
            accounts.unshift({id:'default', text:"-----Select Account-----"});
            $('.account').select2({
                  data: accounts
            });
            agents.unshift({id:'default', text:"-----Select Agent-----"});
            $('.agent').select2({
                  data: agents
            });
        }
    );

    var name = $('#name').val();
    var report = true;

    $('.input').on('change',function(e){
        formData[$(this).prop('name')] = $(this).val();
    });

    $('#searchBtn').on('click', function(e){
        e.preventDefault();
        $.ajax({
            url: '/agent/search_transactions',
            method: "post",
            data:{"filter": JSON.stringify(formData),"name": name, "report": report},
            success: function(response, status, xhr, $form) {
                if (response.status){
                    ReportsTable.destroy();
                    let responseTxnData = [];
                    let formattedTxnData = []
                    Object.assign(responseTxnData, response.data[0].data)
                    Object.assign(formattedTxnData, response.data[0].data)
                    formattedTxnData = formatTransactionData(responseTxnData, reportHeaders)
                    const reportData = filterTransactionData(formattedTxnData, reportHeaders)
                    ReportsTable.init(response.data);
                }
//                var newTableData = $.map( response.data, function( elem, index ) {
//                  elem.sn = index + 1;
//                  return elem;
//                });
            }
        });
   });

    $('#reportsTable').on('click','#exportExcel', function(e){
        e.preventDefault();
        var reportData = JSON.parse(atob($(this).data('report')));
        generateExcel(reportData, 'transactions', 'report.xlsx');
    });

    let txnData = {};

    $('#reverseModal').on('show.bs.modal', function(e) {
        txnData =JSON.parse(atob($(e.relatedTarget).data('data')));
        $('.modal-body').html(
            `<ul class="list-group">
                <li class="list-group-item">${txnData.reference_number}</li>
                <li class="list-group-item">${txnData.amount}</li>
                <li class="list-group-item">${txnData.rrn}</li>
                <li class="list-group-item">${txnData.account_number}</li>
                <li class="list-group-item">${txnData.status}</li>
            </ul>`
        );
    });


    /** Begin Reconciliation section **/
    let internalTxnData = [];
    let externalTxnData = [];
    let newExternalTxnData = [];

    let availableInternal = [];
    let availableExternal = [];

    const serviceHeaders = ["amount", "rrn", "terminal_id", "card_number", "bank", "transaction_type", "is_reversal", "status"]
    let selectedHeaders = {};
    const setHeadersModal = $('#setHeadersModal')
    const headersSetting =  $('#headersSetting')
    $('#resetFilters').on('click',function(e){
        e.preventDefault();
        $('#filterForm').resetForm();
    });

    $('#reportFile').on('change',function(e){
        const reader = new FileReader();
        reader.readAsArrayBuffer(e.target.files[0]);
        reader.onload = function (e) {
            const data = new Uint8Array(reader.result);
            const workbook = XLSX.read(data, {type: 'array'});
            const sheet = workbook.SheetNames[0];
            const worksheet = workbook.Sheets[sheet];
            const reportData = XLSX.utils.sheet_to_json(worksheet);
            const reportHeaders = Object.keys(reportData[0]);
            externalTxnData = {data: reportData, headers: reportHeaders}
            setHeadersModal.modal('show');
        }
    });

    setHeadersModal.on('show.bs.modal', function(e) {
        headersSetting.empty();
        selectedHeaders = {}
        const docHeaders = $.map( externalTxnData.headers, function(elem) {
            return {id:elem, text: elem};
        });

        docHeaders.unshift({id:'default', text:"-----Select column-----"});

        $.each(serviceHeaders, function( index, value ) {
            if (value !== 'is_reversal') {
                headersSetting.append(
                    `<div class="form-group">
                        <label for="${value}" class="form-control-label">${value}</label>
                        <div style="margin-bottom: 15px;" id="${value}Div">
                            <select name="${value}" class="headerInput headersSelect" id="${value}" style="width: 100%; height: 50px; line-height: 50px;">
                            </select>
                        </div>
                    </div>`
                );
            }
        });

        $('.headersSelect').select2({
            data: docHeaders
        });

        $('.headerInput').on('change',function(e){
            selectedHeaders[$(this).prop('name')] = $(this).val();
            if ($(this).prop('name') === 'transaction_type') {
                $('#headersSetting').append(
                    `<div class="form-group">
                        <label for="is_reversal" class="form-control-label">reversal indicating value</label>
                        <div style="margin-bottom: 15px;" id="reversalValueDiv">
                            <select name="is_reversal" class="headerInput headersSelect" id="isReversal" style="width: 100%; height: 50px; line-height: 50px;">
                            </select>
                        </div>
                    </div>`
                );
                const possibleReversalValues = getColumnValues(externalTxnData.data, $(this).val())
                $('#isReversal').select2({
                   data: possibleReversalValues,
                   multiple: true
                });
            }

            if ($(this).prop('name') === 'status') {
                $('#headersSetting').append(
                    `<div class="form-group">
                        <label for="failed" class="form-control-label">Declined status indicating value</label>
                        <div style="margin-bottom: 15px;" id="reversalValueDiv">
                            <select name="failed" class="headerInput headersSelect" id="failed" style="width: 100%; height: 50px; line-height: 50px;">
                            </select>
                        </div>
                    </div>`
                );
                const possibleFailedValues = getColumnValues(externalTxnData.data, $(this).val())
                $('#failed').select2({
                    data: possibleFailedValues
                });
            }
        });
    });

    setHeadersModal.on('change', '.headersSelect', function (e){
        selectedHeaders[$(this).prop('name')] = $(this).val();
    });

    $('#setHeadersBtn').on('click', function(e) {
        let filter = selectedHeaders
        let failedStatus = filter['failed']
        let isReversalCol = filter['transaction_type']
        let statusCol = filter['status']
        let isReversal = filter['is_reversal']
        delete filter.failed
        delete filter.is_reversal
        const dataChanger = inverseObject(filter)
        newExternalTxnData = formatData(externalTxnData.data, failedStatus, statusCol, isReversalCol, isReversal, dataChanger)
        $('#setHeadersModal').modal('hide');
    });

    $('#reconcileBtn').on('click', function(e) {
        e.preventDefault();
        $.ajax({
            url: '/agent/search_transactions',
            method: "post",
            async: false,
            data:{"filter": JSON.stringify(formData),"name": name, "report": report},
            success: function(response, status, xhr, $form) {
                if (response.status){
                    internalTxnData = response.data
                    //ReportsTable.destroy();
                    //ReportsTable.init(response.data);
                }
//                var newTableData = $.map( response.data, function( elem, index ) {
//                  elem.sn = index + 1;
//                  return elem;
//                });
            }
        });
        const hashedInternalTxnData = createReconciliationMap(internalTxnData[0].data, 'amount', 'rrn', 'terminal_id', 'is_reversal')
        const hashedExternalTxnData = createReconciliationMap(newExternalTxnData, 'amount', 'rrn', 'terminal_id', 'is_reversal')

        $.each(hashedInternalTxnData, function( key, value ) {
            if (key in hashedExternalTxnData) {
                delete hashedExternalTxnData[key]
            }else{
                availableInternal.push(value)
            }
        });

        if (!$.isEmptyObject(hashedExternalTxnData)) {
            availableExternal = Object.values(hashedExternalTxnData)
            BankTransactionTable.destroy();
            BankTransactionTable.init(availableExternal);

        }else{
            $.notify({
                // options
                icon: 'glyphicon glyphicon-warning-sign',
                title: '',
                message: 'all transactions have been reconciled',
            });
            console.log('all transactions have been reconciled');
        }

        if (!$.isEmptyObject(hashedInternalTxnData)) {
            availableInternal = Object.values(hashedInternalTxnData)
            CompanyTransactionTable.destroy();
            CompanyTransactionTable.init(availableInternal);
        }
        $('#reportCollapse').collapse('toggle');
    });


});
