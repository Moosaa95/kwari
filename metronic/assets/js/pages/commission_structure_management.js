const StructureTable = function() {
	const initTable1 = function() {
		const table = $('#commissionStructureTable');
		// begin first table
		table.DataTable({
			responsive: true,
			searchDelay: 500,
			ajax: {
			    url:'/agent/get_structures',
			    type:'POST',
			    data:{'get_structures':true},
			    dataSrc: function (data) {
                    let count = 0;
                    const tableData = $.map(data,function(obj) {
                      count = count + 1;
                      obj.sn = count;
                      return obj;
                    });
                    return tableData;
				}
			},

			columns: [
				{data: 'sn'},
				{data: 'service__name'},
				{data: 'name'},
				{data: 'code'},
//				{data: 'type'},
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
                            <span class="dropdown">
                                <a href="#" class="btn btn-sm btn-clean btn-icon btn-icon-md" data-toggle="dropdown" aria-expanded="true">
                                  <i class="la la-ellipsis-h"></i>
                                </a>
                                <div class="dropdown-menu dropdown-menu-right">
                                    <a class="dropdown-item" href="#" data-toggle='modal' data-target='#viewBandsModal' data-code='${full.code}' data-servicecode='${full.service__code}'><i class="la la-eye"></i>View</a>
                                    <a class="dropdown-item" href="#"><i class="la la-edit"></i>Edit</a>
                                    <a class="dropdown-item" href="#" id="removeStructure" data-code="${full.code}"><i class="la la-remove"></i>Unassign From All</a>
                                    <a class="dropdown-item" href="#" id="deleteStructure" data-code="${full.code}"><i class="la la-trash"></i>Delete</a>
                                </div>
                            </span>`;

					    // return `
                        // <a href="#null" class="btn btn-sm btn-clean btn-icon btn-icon-md" title="Edit">
                        //   <i class="la la-edit"></i>
                        // </a>
                        // <a href="#null" data-toggle='modal' data-target='#viewBandsModal' data-code='${full.code}' data-servicecode='${full.service__code}' class="btn btn-sm btn-clean btn-icon btn-icon-md" title="View">
                        //   <i class="la la-eye"></i>
                        // </a>
                        // <a href="#null" id="deleteStructure" data-code="${full.code}" class="btn btn-sm btn-clean btn-icon btn-icon-md" title="delete">
                        //   <i class="la la-trash"></i>
                        // </a>`;
					},
				},
			],
		});
	};

	const refreshTable1 = function() {
		const table = $('#commissionStructureTable');
		// begin first table
		table.DataTable().ajax.reload();
	};

	return {

		//main function to initiate the module
		init: function() {
			initTable1();
		},
		refresh:function() {
			refreshTable1();
		},
	};

}();

const DynamicBandTable = function(code, htmlTable, columns) {
    var initTable1 = function(code,htmlTable, columns) {
        //var table = htmlTable
        // begin first table
        htmlTable.DataTable({
            responsive: true,
            searchDelay: 500,
            ajax: {
                url:'/agent/get_structure_bands',
                type:'POST',
                data:{'code':code},
                dataSrc: ''
            },

            columns: columns,
            columnDefs: [
                {
                    targets: -1,
                    title: 'Actions',
                    orderable: false,
                    render: function(data, type, full, meta) {
                        return `
                        <a href="#null" id="editBand" data-band="${full.band}" data-target="#addBandModal" data-toggle="modal" class="btn btn-sm btn-clean btn-icon btn-icon-md" title="Edit">
                          <i class="la la-edit"></i>
                        </a>
                        <a href="#null" id="deleteBand" data-band="${full.band}" class="btn btn-sm btn-clean btn-icon btn-icon-md" title="Delete">
                          <i class="la la-trash"></i>
                        </a>`;
                    },
                },
            ],
        });
    };

    const refreshTable1 = function(htmlTable) {
        //var table = $('#bandsTable');
        // begin first table
        htmlTable.DataTable().ajax.reload();
    };

    const destroyTable1 = function(htmlTable) {
        //var table = $('#bandsTable');
        htmlTable.DataTable().destroy();
    };

    return {

        //main function to initiate the module
        init: function(code, htmlTable,columns) {
            initTable1(code, htmlTable, columns);
        },
        refresh:function(htmlTable) {
            refreshTable1(htmlTable);
        },
        destroy:function(htmlTable) {
            destroyTable1(htmlTable);
        },


    };

}();


$(document).ready(function(){
    let structure_data = [];
    let headers = [];
    let service_headers = []
    let selectedHeaders = {}
    const formData = {};
    let bandData = {};
    let structureCode = '';
    let bandUpdate = false;
    let bandTable = null;
    let serviceCode = null;
    StructureTable.init();

    $('#addStructureModal').on('show.bs.modal', function(e) {
        $('#addStructureForm').resetForm()
        $.post(
            '/agent/get_services',
            {},
            function(response, status){
                var services = $.map( response, function(obj) {
                  return {id:obj.id, text: obj.name};
                });
                services.unshift({id:'default', text:"-----Select a Structure-----"});
                $('#service').select2({
                      data: services
                });
            }
        );
    });

    $('#structureFile').on('change',function(e){
        const reader = new FileReader();
        reader.readAsArrayBuffer(e.target.files[0]);
        reader.onload = function (e) {
             var data = new Uint8Array(reader.result);
             var workbook = XLSX.read(data,{type:'array'})
             var sheet = workbook.SheetNames[0];
             var worksheet = workbook.Sheets[workbook.SheetNames[0]];
             structure_data = XLSX.utils.sheet_to_json(worksheet);
             headers = Object.keys(structure_data[0]);
        }

    });

    $('#setHeadersModal').on('show.bs.modal', function(e) {
        $('#headersSetting').empty();
        let docHeaders = $.map( headers, function(elem) {
            return {id:elem, text: elem};
        });
        docHeaders.unshift({id:'default', text:"-----Select column-----"});
        $.each(service_headers, function( index, value ) {
            $('#headersSetting').append(
                `<div class="form-group">
                    <label for="${value}" class="form-control-label">${value}</label>
                    <div style="margin-bottom: 15px;" id="${value}Div">
                        <select name="${value}" class="headerInput headersSelect" id="${value}" style="width: 100%; height: 50px; line-height: 50px;">
                        </select>
                    </div>
                </div>`
            );
        });
        $('.headersSelect').select2({
            data: docHeaders
        });
        $('.headerInput').on('change',function(e){
            selectedHeaders[$(this).prop('name')] = $(this).val();
        });
    });

    /*capture input from add structure form*/
    $('.input').on('change',function(e){
        formData[$(this).prop('name')] = $(this).val();
        if ($(this).prop('name') === 'service_id'){
            if ($( '#service option:selected' ).text() === 'withdrawal') {
                service_headers = ['band','start', 'end', 'charges', 'type', 'agent_com', 'extra_charge']
            } else if ($( '#service option:selected' ).text() === 'bank transfer') {
                service_headers = ['band','start', 'end', 'charges', 'agent_com']
            } else if ($( '#service option:selected' ).text() === 'wallet transfer') {
                service_headers = ['band','start', 'end', 'charges']
            } else if ($( '#service option:selected' ).text() === 'aedc purcahse') {
                service_headers = ['band','start', 'end', 'company_com', 'agent_com', 'type']
            }
        }
    });

    $('.band-input').on('change',function(e){
        bandData[$(this).prop('name')] = removeCommas($(this).val());
    });

    $('#createStructureBtn').on('click', function(e){
        $('#addStructureModal').modal('hide');
        $('#setHeadersModal').modal('show');
    });

    $('#setHeaders').on('click', function(e){
        $.each(structure_data, function( index, row ) {
            $.each(selectedHeaders, function( key, header ) {
                if (row[header]) {
                    /**if (typeof row[header] === 'string' || row[header] instanceof String){
                        row[header] = removeCommas(row[header])
                    }**/
                    row[key] = row[header];
                } else {
                    row[key] = 0;
                }
                delete row[header];
            });
        });
        formData['structure'] = structure_data

        $.ajax({
            url: '/agent/create_structure',
            type: 'POST',
            dataType: 'json',
            data: {form_data: JSON.stringify(formData)},
            beforeSend : function() {
                $(this).addClass('kt-spinner kt-spinner--v2 kt-spinner--sm kt-spinner--success kt-spinner--right kt-spinner--input');
            },
            success: function(response, status, xhr, $form) {
                if (response) {
                    $('#setHeadersModal').modal('hide');
                    StructureTable.refresh();
                }
                else{
                    console.log("please try again")
                }
                $(this).removeClass('kt-spinner kt-spinner--v2 kt-spinner--sm kt-spinner--success kt-spinner--right kt-spinner--input');
            }
        });
    });

    $('#viewBandsModal').on('show.bs.modal', function(e) {
        structureCode = $(e.relatedTarget).data('code');
        serviceCode = $(e.relatedTarget).data('servicecode');
        let columns = null;
        if (serviceCode === 'with01'){
              columns = [
                {data: 'band'},
                {data: 'start'},
                {data: 'end'},
                {data: 'charges'},
                {data: 'type'},
                {data: 'extra_charge'},
                {data: 'agent_com'},
                {data: 'Actions', responsivePriority: -1},
            ]
            $('#bandModalContent').html(
                `<table class="table table-striped- table-bordered table-hover table-checkable" id="bandsTable">
                <thead>
                    <tr>
                        <th scope="col">Band</th>
                        <th scope="col">Start</th>
                        <th scope="col">End</th>
                        <th scope="col">Charges</th>
                        <th scope="col">Type</th>
                        <th scope="col">Extra Charge</th>
                        <th scope="col">Agent Commission</th>
                        <th>Actions</th>
                    </tr>
                </thead>
            </table>`
            );
        }

        if (serviceCode === 'tran01'){
            columns = [
                {data: 'band'},
                {data: 'start'},
                {data: 'end'},
                {data: 'charges'},
                {data: 'agent_com'},
                {data: 'Actions', responsivePriority: -1},
            ]
            $('#bandModalContent').html(
                `<table class="table table-striped- table-bordered table-hover table-checkables" id="bandsTable">
                    <thead>
                        <tr>
                            <th scope="col">Band</th>
                            <th scope="col">Start</th>
                            <th scope="col">End</th>
                            <th scope="col">Charges</th>
                            <th scope="col">Agent Commission</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                </table>`
            )
            //bandTable = $('#transferBandsTable');
        }

        if (serviceCode === 'aedc01'){
            columns = [
                {data: 'band'},
                {data: 'start'},
                {data: 'end'},
                {data: 'company_com'},
                {data: 'agent_com'},
                {data: 'type'},
                {data: 'Actions', responsivePriority: -1},
            ]
            $('#bandModalContent').html(
                `<table class="table table-striped- table-bordered table-hover table-checkables" id="bandsTable">
                    <thead>
                        <tr>
                            <th scope="col">Band</th>
                            <th scope="col">Start</th>
                            <th scope="col">End</th>
                            <th scope="col">Company Commission</th>
                            <th scope="col">Agent Commission</th>
                            <th scope="col">Charge Type</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                </table>`
            )
        }

        bandTable = $('#bandsTable');
        DynamicBandTable.init(structureCode,bandTable,columns)
    });

    // $('#viewBandsModal').on('hide.bs.modal', function(e) {
    //     console.log(bandTable)
    //     //DynamicBandTable.destroy(bandTable);
    //     $('#viewBandsModal').modal('hide');
    // });
    $('#closeBandModalBtn').on('click', function(e){
        //BandTable.destroy();
        DynamicBandTable.destroy(bandTable)
        $('#viewBandsModal').modal('hide');
    })


    $(document).on('click', '#deleteStructure', function(e){
        e.preventDefault();
        const code = $(e.target).data('code');
        $.ajax({
            url: '/agent/delete_structure',
            type: 'POST',
            dataType: 'json',
            data: {'code': code},
            success:function(response) {
                    if (response.result){
                        StructureTable.refresh();
                    }
                    else{
                        alert('you can not delete assigned structures.Please un-assign first');
                    }
            }
        });
    });

    $(document).on('click', '#removeStructure', function(e){
        e.preventDefault();
        const code = $(e.target).data('code');
        $.ajax({
            url: '/agent/remove_structure',
            type: 'POST',
            dataType: 'json',
            data: {'structure_code': code},
            success:function(response) {
                if (response.result){
                    StructureTable.refresh();
                }
                else{
                    alert('you can not remove structure from all accounts');
                }
            }
        });
    });

    $('#addBandModal').on('show.bs.modal', function(e) {
        const bandContent = $('#bandContent')
        bandContent.empty();
        const band = $(e.relatedTarget).data('band')

        if (serviceCode === 'with01') {
            service_headers = ['band','start', 'end', 'charges', 'type', 'agent_com', 'extra_charge']
        } else if (serviceCode === 'tran01')  {
            service_headers = ['band','start', 'end', 'charges', 'agent_com']
        } else if (serviceCode === 'aedc01')  {
            service_headers = ['band','start', 'end', 'company_com', 'agent_com', 'type']
        }

        $.each(service_headers, function( index, value ) {
            bandContent.append(
                `<div class="form-group">
                    <label for="${value}" class="form-control-label">${value}</label>
                    <div style="margin-bottom: 15px;" id="${value}Div">
                        <input name="${value}" id="${value}" type="text" class="form-control add-band-input addComma">
                    </div>
                </div>`
            );
        });

        $('.add-band-input').on('change',function(e){
            let value = removeCommas($(this).val());
            if (!isNaN(value)){
                value = parseFloat(value)
            }
            bandData[$(this).prop('name')] = value
            console.log(bandData)
        });

        $( ".addComma").on('keyup',function(){
            const m = commaSeparator($(this).val());
            $(this).val(m)
        });

        if (band){
            bandUpdate = true;
            $.post(
            '/agent/get_band',
            {band:band, code:structureCode},
            function(response, status){
                console.log(response)
                bandData =  response.result
                populateForm('#bandContent',response.result);
                $('#addBandBtn').text('Update');
            });
        }
    });

    $('#addBandBtn').on('click', function(e){
        if(bandUpdate){
            $.ajax({
                url: '/agent/update_band',
                type: 'POST',
                dataType: 'json',
                data: {band: JSON.stringify(bandData), code:structureCode},
                beforeSend : function() {
                    $(this).addClass('kt-spinner kt-spinner--v2 kt-spinner--sm kt-spinner--success kt-spinner--right kt-spinner--input');
                },
                success: function(response, status, xhr, $form) {
                    if (response) {
                        $('#addBandModal').modal('hide');
                        //BandTable.refresh();
                        DynamicBandTable.refresh(bandTable)
                    }
                    else{
                        console.log("please try again")
                    }
                    $(this).removeClass('kt-spinner kt-spinner--v2 kt-spinner--sm kt-spinner--success kt-spinner--right kt-spinner--input');
                }
            });

       }else{
        $.ajax({
            url: '/agent/add_band',
            type: 'POST',
            dataType: 'json',
            data: {band: JSON.stringify(bandData), code:structureCode},
            beforeSend : function() {
                     $(this).addClass('kt-spinner kt-spinner--v2 kt-spinner--sm kt-spinner--success kt-spinner--right kt-spinner--input');
                    },
            success: function(response, status, xhr, $form) {
                if (response) {
                   $('#addBandModal').modal('hide');
                   //BandTable.refresh();
                    DynamicBandTable.refresh(bandTable)
                }
                else{
                    console.log("please try again")
                }
                $(this).removeClass('kt-spinner kt-spinner--v2 kt-spinner--sm kt-spinner--success kt-spinner--right kt-spinner--input');
            }
        });
       }
    });

    $(document).on('click', '#deleteBand', function(e){
        e.preventDefault();
        const band = $(e.currentTarget).data('band')
        $.post(
            '/agent/delete_band',
            {band:band, code:structureCode},
            function(response, status){
                if (response){
                    DynamicBandTable.refresh(bandTable);
                }
                else{
                    alert('you can not delete band');
                }
            });
    });
});
