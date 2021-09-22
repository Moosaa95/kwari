$(document).ready(function(){
    const product = JSON.parse($('#prodData').text());
    console.log(product)
    const productCarousel = $(".single-product");
    const tabs = $("#tabsDiv");
    let latest = ''
    let productImages = [];
    // $.each(product.images, (index,value)=>{
    //     $("#productImages").append(
    //         `<div class="item">
    //             <img src="/media/${value}" alt="${value}">
    //         </div>`
    //     )
    // });
    // rebuildCarousel(productCarousel)


    $.each(product.images, (index,value)=>{
        const item = `<div class="item"><img src="/media/${value}" alt="product"></div>`
        addAndRefreshCarousel(productCarousel, item);
    });
    console.log(product)
    $("#name").text(product.name);
    $("#price").text(commaSeparator(product.agent_price));
    $("#qty").text(commaSeparator(product.quantity_left.toString()));

    $("#share").on("click", function (e){
       e.preventDefault();
        if (navigator.canShare && navigator.canShare({ files: product.images })) {
            navigator.share({
                files: product.images,
                title: product.name,
                text: `Photos of ${product.name}.`,
            })
                .then(() => console.log('Share was successful.'))
                .catch((error) => console.log('Sharing failed', error));
        } else {
            console.log(`Your system doesn't support sharing files.`);
        }
    });

    $("#purchase").on("click", function (e){
        console.log("################")
        e.preventDefault();

        $('#accountDetails').modal('show');

    });

});