$(document).ready(function () {
	const initData = JSON.parse($('#initData').text());
	console.log(initData);
	const categoriesCarousel = $('.shop-categoris');
	const tagCarousel = $('.item-category-link');
	// const productCarousel = $(".item-category");
	const productCarousel = $('.single-product');
	const tabs = $('#tabsDiv');
	let latest = '';
	let productImages = {};
	const csrf_token = readCookie('csrftoken');
	$.each(initData.categories, (index, value) => {
		$('#categoriesDiv').append(
			`<div class="item">
                <a href="#">
                    <img style="width: 100px; height: 100px;" src="/media/${
											value.image
										}" alt="${value.category__name}">
                    <h4>${value.category__name.toUpperCase()}</h4>
                </a>
            </div>`
		);
	});
	rebuildCarousel(categoriesCarousel);
	$.each(initData.tags, (index, value) => {
		latest = value.tag_id === 'latest' ? value.tag_id : 'latest';
		$('#tagsDiv').append(
			`<div class="item text-left"><h4 data-profile="${value.name}">${value.name}</h4></div>`
		);
	});
	rebuildCarousel(tagCarousel);

	if (latest) {
		$.ajax({
			url: '/app/get_home_images',
			type: 'POST',
			data: { tag: 'latest' },
			headers: { 'X-CSRFToken': csrf_token },
			async: false,
			success: function (response) {
				console.log(response);
				productImages = { ...response, ...productImages };
				// $.each(response, (index,value)=>{
				//     const item = `<div class="item list-item-full bg-gradiant-black pl-0 pr-0 home-image">
				//                     <figure class="mb-0">
				//                         <a href="#"><img src="/media/${value.image}" alt="image"></a>
				//                      </figure>
				//                     <div class="content-div">
				//                         <a href="#">
				//                             <h2 class="fw-600 text-white mb-1">${value.product__name}<br></h2>
				//                             <span><i class="ti-location-pin mr-2 text-white"></i>@${value.product__agent_price}</span>
				//                         </a>
				//                     </div>
				//                         <i class="ti-share mt-3 text-red bg-white"></i>
				//                    </div>`
				//
				//     addAndRefreshCarousel(productCarousel, item);
				// });
			},
		});
	}
	console.log(productImages);
	$.each(productImages, (index, value) => {
		console.log(index);
		//agent/product_detail?product_id=${value.product__id}
		const item = `<div class="item">
                                    <figure class="product-image mb-0">
                                        <img src="/media/${value.image}" alt="image">
                                     </figure>
                                        <a class="product-info-wrapper" href="/agent/product_detail?product_id=${value.product__id}">
                                            <span><h2 class="fw-600 mb-1">${value.product__name}<br></h2></span>
                                            <span><i class="ti-location-pin mr-2"></i>Price: ${value.product__agent_price}</span>
                                            <span><i class="ti-location-pin mr-2"></i>Quantity Available: ${value.product__quantity_left}</span>
                                        </a>
                                   </div>`;

		addAndRefreshCarousel(productCarousel, item);
	});
});
