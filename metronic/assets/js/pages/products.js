const table = $('#productsTable');

console.log($('#activeAccountTab').hasClass('active'))
var ProductTable = (function () {
	var initTable1 = function (query_params) {
		// begin first table
		table.DataTable({
			responsive: true,
			searchDelay: 500,
			//			processing: true,
			//			serverSide: true,
			ajax: {
				url: '/app/kwari_products',
				type: 'GET',
				data: query_params,
				dataSrc: function (data) {
					var count = 0;
					var tableData = $.map(data, function (obj) {
						count = count + 1;
						obj.sn = count;
						obj.in_stock = obj.in_stock ? 'Yes' : 'No';
						return obj;
					});
					return tableData;
				}
			},

			columns: [
				{ data: 'sn' },
				{ data: 'name' },
				{ data: 'quantity' },
				{ data: 'unit_price' },
				{ data: 'agent_price' },
				{ data: 'category__name' },
				{ data: 'quantity_left' },
				{ data: 'in_stock' },
				{ data: 'stock_date' },
				{ data: 'sold_date' },
				{ data: 'Actions', responsivePriority: -1 }
			],
			columnDefs: [
				{
					targets: -1,
					title: 'Actions',
					orderable: false,
					render: function (data, type, full, meta) {
						return `<span class="dropdown">
									<a href="#" class="btn btn-sm btn-clean btn-icon btn-icon-md" data-toggle="dropdown" aria-expanded="true">
									  <i class="la la-ellipsis-h"></i>
									</a>
									<div class="dropdown-menu dropdown-menu-right">
										<a class="dropdown-item" href="#" data-toggle="modal" data-target="#editTerminalModal" data-terminal="${full.id}"><i class="la la-edit"></i>Edit</a>
										<a class="dropdown-item" href="#" id="deleteTerminal" data-terminal="${full.id}"><i class="la la-trash"></i>Delete</a>
									</div>
								</span>`;
					}
				}
			]
		});
	};

	var refreshTable1 = function (query_params) {
		// begin first table
		table.dataTable().fnDestroy();
		initTable1(query_params);
		// table.DataTable().ajax.reload();
	};

	return {

		//main function to initiate the module
		init: function () {
			//compute query params
		const query_params = { in_stock: true };
			initTable1(query_params);
		},
		refresh: function (query_params) {
			
			refreshTable1(query_params);
		}
	};
})();

//on clicking 'product in stock' tab
	$('#activeAccountTab').on('click', () => {
		//compute query params
		const query_params = { in_stock: true };
		ProductTable.refresh(query_params);
	});

	//on clicking 'product out of stock' tab
	$('#inactiveAccountTab').on('click', () => {
		//compute query params
const query_params = { sold: true };

		ProductTable.refresh(query_params);
	});

$(document).ready(function () {
	let editDetails = {};
	ProductTable.init();


	// $('#addTerminalModal').on('show-bs-modal', function (e) {
	// 	$('#stampDuty').prop('checked', true);
	// });

	$('#createProduct').on('click', function (e) {
		$('#addProductForm').ajaxSubmit({
			url: '/app/kwari_products',
			beforeSend: function () {
				$('#createProduct').addClass(
					'kt-spinner kt-spinner--v2 kt-spinner--sm kt-spinner--success kt-spinner--right kt-spinner--input'
				);
			},
			success: function (response, status, xhr, $form) {
				if (response.status) {
					$('#addProductModal').modal('hide');
					ProductTable.refresh();
				} else {
					$('#addProductModal').modal('hide');
					$.notify(
						{
							// options
							icon: 'glyphicon glyphicon-warning-sign',
							title: '',
							message: 'Product creation failed'
						},
						{
							type: 'danger'
						}
					);
					console.log('please try again');
				}
				$('#createProduct').removeClass(
					'kt-spinner kt-spinner--v2 kt-spinner--sm kt-spinner--success kt-spinner--right kt-spinner--input'
				);
			}
		});
	});

	// $(document).on('click', '#deleteTerminal', function (e) {
	// 	e.preventDefault();
	// 	// var terminal = $(e.target).data('terminal');
	// 	const terminal = $(e.currentTarget).data('terminal');
	// 	console.log(terminal);
	// 	$.ajax({
	// 		url: '/agent/delete_terminal',
	// 		type: 'POST',
	// 		dataType: 'json',
	// 		data: { terminal_id: terminal },
	// 		success: function (response) {
	// 			if (response.result) {
	// 				TerminalTable.refresh();
	// 			} else {
	// 				alert('you can not delete terminal');
	// 			}
	// 		}
	// 	});
	// });

	// $('#editTerminalModal').on('show.bs.modal', function (e) {
	// 	const editTerminalContent = $('#editTerminalContent');
	// 	terminal_id = $(e.relatedTarget).data('terminal');
	// 	$.post('/agent/get_terminal_detail', { terminal_id: terminal_id }, function (response, status) {
	// 		editTerminalContent.empty();
	// 		if (response.status && response.terminal_detail) {
	// 			stampDuty = response.terminal_detail['has_stamp_duty'];
	// 			status = response.terminal_detail['status'];
	// 			delete response.terminal_detail['has_stamp_duty'];
	// 			delete response.terminal_detail['status'];

	// 			$.each(response.terminal_detail, function (key, value) {
	// 				editTerminalContent.append(
	// 					`<div class="form-group">
	//                               <label for="${key}" class="form-control-label">${key}</label>
	//                               <div class="input-group">
	//                                   <div class="input-group-prepend">
	//                                       <span class="input-group-text"></span>
	//                                   </div>
	//                                   <input type="text" class="form-control form-input addComma" name=${key} value="${value}"/>
	//                               </div>
	//                           </div>`
	// 				);
	// 			});
	// 			editTerminalContent.append(
	// 				`<div class="form-group row">
	// 						<div class="col-lg-6">
	// 							<label for="stampDuty" class="form-control-label">Has Stamp Duty</label>
	// 							<div class="input-group">
	// 								<span class="kt-switch kt-switch--icon">
	// 									<label>
	// 										<input type="checkbox" name="has_stamp_duty" class="form-control switch-input" checked="" id="stampDuty">
	// 											<span></span>
	// 									</label>
	// 								</span>
	// 							</div>
	// 						</div>
	// 						<div class="col-lg-6">
	// 							<label for="status" class="form-control-label">Status</label>
	// 							<div class="input-group">
	// 								<span class="kt-switch kt-switch--icon">
	// 									<label>
	// 										<input type="checkbox" name="status" class="form-control switch-input" checked="" id="status">
	// 											<span></span>
	// 									</label>
	// 								</span>
	// 							</div>
	// 						</div>
	// 					</div>`
	// 			);
	// 		}

	// 		$('#stampDuty').prop('checked', stampDuty);
	// 		$('#status').prop('checked', status);

	// 		// $('#stampDuty').on('change',function(){
	// 		// 	stampDuty =  $(this).prop('checked');
	// 		// 	console.log(status);
	// 		// });
	// 		//
	// 		// $('#status').on('change',function(){
	// 		// 	status =  $(this).prop('checked');
	// 		// 	console.log(status);
	// 		// });

	// 		$('.form-input').on('change', function (e) {
	// 			editDetails[$(this).prop('name')] = $(this).val();
	// 		});

	// 		$('.switch-input').on('change', function (e) {
	// 			editDetails[$(this).prop('name')] = $(this).prop('checked');
	// 		});
	// 	});
	// });

	// $('#saveEdits').on('click', function (e) {
	// 	e.preventDefault();
	// 	$.ajax({
	// 		url: '/agent/edit_terminal',
	// 		type: 'POST',
	// 		dataType: 'json',
	// 		data: { details: JSON.stringify(editDetails), terminal_id: terminal_id },
	// 		success: function (response) {
	// 			if (response.status) {
	// 				$('#editTerminalModal').modal('hide');
	// 			} else {
	// 				alert('you can not edit terminal.');
	// 			}
	// 		}
	// 	});
	// });
});
