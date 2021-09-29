const table = $('#agentsTable');
const AgentsTable = (function () {
	const initTable1 = function () {
		// begin first table
		table.DataTable({
			responsive: true,
			searchDelay: 500,
			//			processing: true,
			//			serverSide: true,
			ajax: {
				url: '/app/fetch_agents',
				type: 'POST',
				data: {},
				dataSrc: function (data) {
					console.log(data);
					let count = 0;
					return $.map(data, function (obj) {
						count = count + 1;
						obj.sn = count;
						obj.name = obj.name.toUpperCase(); //obj.first_name+' '+obj.surname
						obj.status = obj.status ? 1 : 2;
						return obj;
					});
				},
			},

			columns: [
				{ data: 'sn' },
				{ data: 'name' },
				{ data: 'purchases' },
				{ data: 'packaged' },
				{ data: 'status' },
				{ data: 'Actions', responsivePriority: -1 },
			],
			columnDefs: [
				{
					targets: -1,
					title: 'Actions',
					orderable: false,
					render: function (data, type, full, meta) {
						return `
                        <a href="account_detail?account_id=${full.id}" class="btn btn-sm btn-clean btn-icon btn-icon-md" title="View">
                          <i class="la la-eye"></i>
                        </a>`;
					},
				},
				{
					targets: -2,
					render: function (data, type, full, meta) {
						const status = {
							1: { title: 'Active', class: ' kt-badge--success' },
							2: { title: 'Inactive', class: ' kt-badge--warning' },
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

	return {
		//main function to initiate the module
		init: function () {
			initTable1();
		},
		refresh: function () {
			table.DataTable().ajax.reload();
		},
	};
})();

$(document).ready(function () {
	AgentsTable.init();
	$('#state').select2();
	$('#gender').select2();

	// Agent creation
	const createAgent = $('#createAgent');
	const addAgentModal = $('#addAgentModal');

	addAgentModal.on('show-bs-modal', function (e) {
		$('#status').prop('checked', true);
	});

	createAgent.on('click', function (e) {
		console.log(serializeForm('#addAgentForm'));
		$('#addAgentForm').ajaxSubmit({
			url: '/app/create_agent',
			beforeSend: function () {
				createAgent.addClass(
					'kt-spinner kt-spinner--v2 kt-spinner--sm kt-spinner--success kt-spinner--right kt-spinner--input'
				);
			},
			success: function (response, status, xhr, $form) {
				if (response.status) {
					addAgentModal.modal('hide');
					AgentsTable.refresh();
					$.notify({
						// options
						icon: 'glyphicon glyphicon-warning-sign',
						title: '',
						message: 'Agent has been created successfully',
					});
					alert(
						`Copy credentials and send to agent \n Username: ${response.username} \n Pin: ${response.pin}`
					);
				} else {
					addAgentModal.modal('hide');
					$.notify(
						{
							// options
							icon: 'glyphicon glyphicon-warning-sign',
							title: '',
							message: 'Agent creation failed',
						},
						{
							type: 'danger',
						}
					);
					console.log('please try again');
				}
				createAgent.removeClass(
					'kt-spinner kt-spinner--v2 kt-spinner--sm kt-spinner--success kt-spinner--right kt-spinner--input'
				);
			},
			error: function () {
				$.notify(
					{
						// options
						icon: 'glyphicon glyphicon-warning-sign',
						title: '',
						message: 'Agent creation failed',
					},
					{
						type: 'danger',
					}
				);
				console.log('please try again');
				createAgent.removeClass(
					'kt-spinner kt-spinner--v2 kt-spinner--sm kt-spinner--success kt-spinner--right kt-spinner--input'
				);
			},
		});
	});
});
