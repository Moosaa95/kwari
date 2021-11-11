const table = $('#productsTable');

const ProductTable = (function () {
	const initTable = function (query_params) {
		table.DataTable({
			responsive: true,
			searchDelay: 500,
			ajax: {
				url: '/app/get_products',
				type: 'GET',
				data: query_params,
				dataSrc: function (data) {
					let count = 0;
					return $.map(data, function (obj) {
						count = count + 1;
						obj.sn = count;
						obj.in_stock = obj.in_stock ? 'Yes' : 'No';
						return obj;
					});
				},
			},

			columns: [
				{ data: 'sn' },
				{ data: 'name' },
				{ data: 'quantity' },
				{ data: 'unit_price' },
				// { data: 'agent_price' },
				{ data: 'category__name' },
				{ data: 'quantity_left' },
				{ data: 'in_stock' },
				{ data: 'stock_date' },
				{ data: 'sold_date' },
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
									<a class="dropdown-item" href="#" data-target="#addProductImageModal" data-toggle="modal" data-product="${full.id}"><i class="la la-image"></i>Add Picture</a>
										<a class="dropdown-item" href="#" data-toggle="modal" data-target="#editProductModal" data-product="${full.id}"><i class="la la-edit"></i>Edit</a>
										<a class="dropdown-item" href="#" id="deleteProduct" data-product="${full.id}"><i class="la la-trash"></i>Delete</a>
										
									</div>
								</span>`;
					},
				},
				{
					targets: [-5, -7, -8, -9],
					render: function (data, type, full, meta) {
						if (typeof data === 'undefined') {
							return data;
						}
						return commaSeparator(data.toString());
					},
				},
				{
					targets: [-2, -3],
					render: function (data, type, full, meta) {
						if (typeof data === 'undefined' || data === null) {
							return data;
						}
						return moment(data).format('dddd, MMMM Do YYYY, h:mm a');
					},
				},
			],
		});
	};

	const destroyTable = function () {
		table.dataTable().fnDestroy();
	};

	const refreshTable = function () {
		table.DataTable().ajax.reload();
	};

	return {
		//function to initiate the module
		init: function (query_params) {
			//const query_params = { in_stock: true };
			initTable(query_params);
		},

		reInitialize: function (query_params) {
			destroyTable();
			initTable(query_params);
		},

		refresh: function () {
			refreshTable();
		},
	};
})();

$(document).ready(function () {
	ProductTable.init({ in_stock: true });
	const addProductImageModal = $('#addProductImageModal');
	const createProductImage = $('#createProductImage');
	let formData = {};

	const defaultStructure = { start: '0', end: '0', charges: '0' };
	const structureKeys = ['start', 'end', 'charges'];
	let chargesStructure = [defaultStructure];
	const chargesTemplate = (index) => `
		<div class="form-group row">
			<div class="col-3">
				<label class="form-control-label">Quantity Start</label>
				<input type="text" name="start-${index - 1}" id="start-${
		index - 1
	}" maxlength="255" class="form-control" inputmode="numeric" pattern="[0-9]" value=${
		chargesStructure[index - 1].start || ''
	}>
			</div>
			<div class="col-3">
				<label class="form-control-label">Quantity End</label>
				<input type="text" name="end-${index - 1}" id="end-${
		index - 1
	}" maxlength="255" class="form-control" inputmode="numeric" pattern="[0-9]" value=${
		chargesStructure[index - 1].end || ''
	}>
			</div>
			<div class="col-3">
				<label class="form-control-label">Charge</label>
				<input type="text" name="charges-${index - 1}" id="charges-${
		index - 1
	}" maxlength="255" class="form-control" inputmode="numeric" pattern="[0-9]" value=${
		chargesStructure[index - 1].charges || ''
	}>
			</div>
			<div class="d-flex flex-grow-1 align-items-center justify-content-start">
				${
					chargesStructure.length !== 1
						? `<button type="button" class="btn btn-danger custom-btn removeChargesInput" id="${
								index - 1
						  }"><i class="la la-times"></i></button>`
						: ''
				}
				${
					chargesStructure.length == index
						? `<button type="button" class="btn btn-primary custom-btn addChargesInput"><i class="la la-plus"></i></button>`
						: ''
				}
			</div>
		</div>
	`;

	$('#category').select2();
	$('#tag').select2();
	//on clicking 'product in stock' tab
	$('#activeAccountTab').on('click', () => {
		const query_params = { in_stock: true };
		ProductTable.reInitialize(query_params);
	});

	//on clicking 'product out of stock' tab
	$('#inactiveAccountTab').on('click', () => {
		const query_params = { sold: true };
		ProductTable.reInitialize(query_params);
	});

	$('#createProduct').on('click', function (e) {
		// let data = serializeForm('#addProductForm');

		formData['quantity'] = removeCommas(formData['quantity']);
		formData['quantity_left'] = removeCommas(formData['quantity_left']);
		formData['unit_price'] = removeCommas(formData['unit_price']);
		formData['in_stock'] = formData.in_stock ? formData.in_stock : 'on';
		$.ajax({
			url: '/app/create_product',
			method: 'post',
			data: { formData: JSON.stringify(formData) },
			beforeSend: function () {
				$('#createProduct').addClass(
					'kt-spinner kt-spinner--v2 kt-spinner--sm kt-spinner--success kt-spinner--right kt-spinner--input'
				);
			},
			success: function (response) {
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
							message: 'Product creation failed',
						},
						{
							type: 'danger',
						}
					);
					console.log('please try again');
				}
				$('#createProduct').removeClass(
					'kt-spinner kt-spinner--v2 kt-spinner--sm kt-spinner--success kt-spinner--right kt-spinner--input'
				);
			},
			error: function () {
				showNotify('An error occured, try again', 'danger');
				$('#createProduct').removeClass(
					'kt-spinner kt-spinner--v2 kt-spinner--sm kt-spinner--success kt-spinner--right kt-spinner--input'
				);
			},
		});
	});

	const handleInput = ({ target: { name, value } }) => {
		const block = name.split('-')[0];
		if (structureKeys.includes(block)) {
			const modifier = name.split('-')[1];
			chargesStructure[modifier] = {
				...chargesStructure[modifier],
				[block]: value,
			};
			formData['charges_structure'] = chargesStructure;
		} else {
			formData[name] = value;
		}
		console.log(formData);
	};

	$('.form-control').on('change', handleInput);

	addProductImageModal.on('show.bs.modal', function (e) {
		const productId = $(e.relatedTarget).data('product');
		$('#productId').val(productId);
	});

	createProductImage.on('click', function (e) {
		$('#addProductImageForm').ajaxSubmit({
			url: '/app/add_product_image',
			beforeSend: function () {
				createProductImage.addClass(
					'kt-spinner kt-spinner--v2 kt-spinner--sm kt-spinner--success kt-spinner--right kt-spinner--input'
				);
			},
			success: function (response, status, xhr, $form) {
				if (response.status) {
					showNotify('picture added successfully', 'success');
				} else {
					showNotify('Fail to add picture', 'danger');
					console.log('please try again');
				}
				addProductImageModal.modal('hide');
				createProductImage.removeClass(
					'kt-spinner kt-spinner--v2 kt-spinner--sm kt-spinner--success kt-spinner--right kt-spinner--input'
				);
			},
		});
	});

	function computeChargesInputList() {
		let chargesStr = '';
		for (let i = 1; i <= chargesStructure.length; i++) {
			chargesStr += chargesTemplate(i);
		}
		$('#charges_structure_wrapper').html(chargesStr);

		$('.form-control').on('change', handleInput);
	}

	$('#addProductModal').on('show.bs.modal', () => {
		computeChargesInputList();
	});

	$(document).on('click', '.addChargesInput', () => {
		chargesStructure = [...chargesStructure, defaultStructure];
		computeChargesInputList();
	});

	$(document).on('click', '.removeChargesInput', ({ target: { id } }) => {
		if (chargesStructure.length > 1) {
			chargesStructure.splice(id, 1);
			computeChargesInputList();
		}
	});
});
