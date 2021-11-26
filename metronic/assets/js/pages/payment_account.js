const table = $('#accountsTable');
const PaymentTable = (function () {
	var initTable1 = function (accountId) {
		// begin first table
		table.DataTable({
			responsive: true,
			searchDelay: 500,
			//			processing: true,
			//			serverSide: true,
			ajax: {
				url: '/app/get_payment_accounts',
				dataSrc: function (data) {
					var count = 0;
					var tableData = $.map(data, function (obj) {
						count = count + 1;
						obj.sn = count;
						return obj;
					});
					return tableData;
				},
			},

			columns: [
				{ data: 'sn' },
				{ data: 'account_number' },
				{ data: 'status' },
				{ data: 'Actions', responsivePriority: -1 },
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
										<a class="dropdown-item" href="#" data-toggle="modal" data-target="#editTerminalModal" data-terminal="${full.terminal_id}"><i class="la la-edit"></i>Edit</a>
										<a class="dropdown-item" href="#" id="deleteTerminal" data-terminal="${full.terminal_id}"><i class="la la-trash"></i>Delete</a>
									</div>
								</span>`;
					},
				},
				{
					targets: -2,
					render: function (data, type, full, meta) {
						var status = {
							'in-use': { title: 'In use  ', class: ' kt-badge--warning' },
							available: { title: 'Available', class: ' kt-badge--success' },
							inactive: { title: 'Inactive', class: ' kt-badge--danger' },
						};
						if (typeof status[data] === 'undefined') {
							return data;
						}
						return (
							'<span class="kt-badge ' +
							status[data].class +
							' kt-badge--inline kt-badge--pill">' +
							status[data].title +
							'</span>'
						);
					},
				},
			],
		});
	};

	var refreshTable1 = function () {
		// begin first table
		table.DataTable().ajax.reload();
	};

	return {
		//main function to initiate the module
		init: function () {
			initTable1();
		},
		refresh: function () {
			refreshTable1();
		},
	};
})();

$(document).ready(function () {
	let editDetails = {};
	let stampDuty = true;
	let status = true;
	let terminal_id = null;
	PaymentTable.init();

	$('#createAccount').on('click', function (e) {
		$('#addAccountForm').ajaxSubmit({
			url: '/app/create_payment_account',
			beforeSend: function () {
				$('#createAccount').addClass(
					'kt-spinner kt-spinner--v2 kt-spinner--sm kt-spinner--success kt-spinner--right kt-spinner--input'
				);
			},
			success: function (response, status, xhr, $form) {
				if (response) {
					$('#addAccountModal').modal('hide');
					PaymentTable.refresh();
					location.reload();
				} else {
					showNotify('An error occured, please try again', 'danger');
				}
				$('#createAccount').removeClass(
					'kt-spinner kt-spinner--v2 kt-spinner--sm kt-spinner--success kt-spinner--right kt-spinner--input'
				);
			},
			error: (error) => {
				$('#createAccount').removeClass(
					'kt-spinner kt-spinner--v2 kt-spinner--sm kt-spinner--success kt-spinner--right kt-spinner--input'
				);
				showNotify('An error occured, please try again', 'danger');
			},
		});
	});

	$(document).on('click', '#deleteTerminal', function (e) {
		e.preventDefault();
		// var terminal = $(e.target).data('terminal');
		const terminal = $(e.currentTarget).data('terminal');
		console.log(terminal);
		$.ajax({
			url: '/agent/delete_terminal',
			type: 'POST',
			dataType: 'json',
			data: { terminal_id: terminal },
			success: function (response) {
				if (response.result) {
					PaymentTable.refresh();
				} else {
					alert('you can not delete terminal');
				}
			},
		});
	});

	$('#editTerminalModal').on('show.bs.modal', function (e) {
		const editTerminalContent = $('#editTerminalContent');
		terminal_id = $(e.relatedTarget).data('terminal');
		$.post(
			'/agent/get_terminal_detail',
			{ terminal_id: terminal_id },
			function (response, status) {
				editTerminalContent.empty();
				if (response.status && response.terminal_detail) {
					stampDuty = response.terminal_detail['has_stamp_duty'];
					status = response.terminal_detail['status'];
					delete response.terminal_detail['has_stamp_duty'];
					delete response.terminal_detail['status'];

					$.each(response.terminal_detail, function (key, value) {
						editTerminalContent.append(
							`<div class="form-group">
                                <label for="${key}" class="form-control-label">${key}</label>
                                <div class="input-group">
                                    <div class="input-group-prepend">
                                        <span class="input-group-text"></span>
                                    </div>
                                    <input type="text" class="form-control form-input addComma" name=${key} value="${value}"/>
                                </div>
                            </div>`
						);
					});
					editTerminalContent.append(
						`<div class="form-group row">
							<div class="col-lg-6">
								<label for="stampDuty" class="form-control-label">Has Stamp Duty</label>
								<div class="input-group">
									<span class="kt-switch kt-switch--icon">
										<label>
											<input type="checkbox" name="has_stamp_duty" class="form-control switch-input" checked="" id="stampDuty">
												<span></span>
										</label>
									</span>
								</div>
							</div>
							<div class="col-lg-6">
								<label for="status" class="form-control-label">Status</label>
								<div class="input-group">
									<span class="kt-switch kt-switch--icon">
										<label>
											<input type="checkbox" name="status" class="form-control switch-input" checked="" id="status">
												<span></span>
										</label>
									</span>
								</div>
							</div>
						</div>`
					);
				}

				$('.form-input').on('change', function (e) {
					editDetails[$(this).prop('name')] = $(this).val();
				});

				$('.switch-input').on('change', function (e) {
					editDetails[$(this).prop('name')] = $(this).prop('checked');
				});
			}
		);
	});

	$('#saveEdits').on('click', function (e) {
		e.preventDefault();
		$.ajax({
			url: '/agent/edit_terminal',
			type: 'POST',
			dataType: 'json',
			data: { details: JSON.stringify(editDetails), terminal_id: terminal_id },
			success: function (response) {
				if (response.status) {
					$('#editTerminalModal').modal('hide');
				} else {
					alert('you can not edit terminal.');
				}
			},
		});
	});
});
