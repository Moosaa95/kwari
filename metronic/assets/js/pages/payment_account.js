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
					render: function (_, _, full, _) {
						return `<span class="dropdown">
									<a href="#" class="btn btn-sm btn-clean btn-icon btn-icon-md" data-toggle="dropdown" aria-expanded="true">
									  <i class="la la-ellipsis-h"></i>
									</a>
									<div class="dropdown-menu dropdown-menu-right">
										<a class="dropdown-item" href="#" data-toggle="modal" data-target="#addAccountModal" data-account=${btoa(
											JSON.stringify(full)
										)}><i class="la la-edit"></i>Edit</a>
										<a class="dropdown-item" href="#" data-toggle="modal" data-target="#deleteAccountModal" data-account=${btoa(
											JSON.stringify(full)
										)}><i class="la la-trash"></i>Delete</a>
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
	let accountDetail = {};
	let terminal_id = null;
	let edit = false;
	PaymentTable.init();

	$('#createAccount').on('click', function (e) {
		let url = '/app/create_payment_account';
		if (Object.keys(accountDetail).length > 0) {
			url = '/app/update_payment_account';
		}
		const formData = serializeForm('#addAccountForm');
		formData.id = accountDetail?.id;
		$.post({
			url,
			data: formData,
			beforeSend: function () {
				$('#createAccount').addClass(
					'kt-spinner kt-spinner--v2 kt-spinner--sm kt-spinner--success kt-spinner--right kt-spinner--input'
				);
			},
			success: function (response) {
				if (response.status) {
					$('#addAccountModal').modal('hide');
					PaymentTable.refresh();
					showNotify(`Account ${edit ? 'updated' : 'created'} successfully`);
					edit = false;
					accountDetail = {};
				} else {
					showNotify('An error occured, please try again', 'danger');
				}
				$('#createAccount').removeClass(
					'kt-spinner kt-spinner--v2 kt-spinner--sm kt-spinner--success kt-spinner--right kt-spinner--input'
				);
			},
			error: () => {
				$('#createAccount').removeClass(
					'kt-spinner kt-spinner--v2 kt-spinner--sm kt-spinner--success kt-spinner--right kt-spinner--input'
				);
				showNotify('An error occured, please try again', 'danger');
			},
		});
	});

	$('#addAccountModal').on('show.bs.modal', (e) => {
		const data = $(e.relatedTarget).data('account');
		console.log(data);
		accountDetail = data ? JSON.parse(atob(data)) : {};
		if (Object.keys(accountDetail).length > 0) {
			$('#accountLabel').html('Edit Account');
			$('#rc_number').val(accountDetail.rc_number);
			$('#company_name').val(accountDetail.company_name);
			$('#kt_datepicker_3').val(accountDetail.incorporation_date);
			$('#status').val(accountDetail.status);
			$('#createAccount').html('Update');
			edit = true;
		} else {
			edit = false;
		}
	});

	$('#deleteAccountModal').on('show.bs.modal', (e) => {
		const data = $(e.relatedTarget).data('account');
		accountDetail = data ? JSON.parse(atob(data)) : {};
		$('#deleteConfirmation').html(
			`Are you sure you want to delete this account: <b>${accountDetail.account_number}</b>?`
		);
	});

	$(document).on('click', '#deleteAccount', function (e) {
		e.preventDefault();
		$.ajax({
			url: '/app/delete_payment_account',
			type: 'POST',
			dataType: 'json',
			data: { account_id: accountDetail.id },
			beforeSend: function () {
				$('#deleteAccount').addClass(
					'kt-spinner kt-spinner--v2 kt-spinner--sm kt-spinner--success kt-spinner--right kt-spinner--input'
				);
			},
			success: function (response) {
				if (response.status) {
					$('#deleteAccountModal').modal('hide');
					PaymentTable.refresh();
					$('#deleteAccount').removeClass(
						'kt-spinner kt-spinner--v2 kt-spinner--sm kt-spinner--success kt-spinner--right kt-spinner--input'
					);
					accountDetail = {};
				} else {
					$('#deleteAccount').removeClass(
						'kt-spinner kt-spinner--v2 kt-spinner--sm kt-spinner--success kt-spinner--right kt-spinner--input'
					);
					showNotify('You can not delete account', 'danger');
				}
			},
			error: () => {
				$('#deleteAccount').removeClass(
					'kt-spinner kt-spinner--v2 kt-spinner--sm kt-spinner--success kt-spinner--right kt-spinner--input'
				);
				showNotify('An error occurred, please try again', 'danger');
			},
		});
	});
});
