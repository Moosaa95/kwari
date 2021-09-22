function showErrorMsg(msg) {
   $('#warning').show();
   $('#warningMessage').text(msg);
}

$(".addComma").on('keyup',function(){
    const m = commaSeparator($(this).val());
    $(this).val(m)
});


$(".moneyFormat").on('load',function(){
    console.log("##################")
    let val = $(this).val() ? $(this).val() : $(this).text();
    const m = commaSeparator(val);
    $(this).val(m)
});


function populateForm(form, data) {
    $.each(data, function(key, value){
        $('[name='+key+']', form).val(value);
    });
}

function isNumber(str) {
    if (typeof str != "string") return false // we only process strings!
    return !isNaN(str) && !isNaN(parseFloat(str))
}

function commaSeparator(nStr) {
    let nStr1=nStr.replace(/,/g, "");
    const patt = new RegExp(/(\d+)(\d{3})/);
    while (patt.test(nStr1)) {
        nStr1=nStr1.replace(patt, '$1,$2');
    }
    return nStr1
}

function removeCommas(number) {
    return number.replace(/,/g, "");
}

function serializeForm(selector) {
    let formData = {};
    const formValues = $(selector).serializeArray();
    $.each(formValues, (i, { name, value }) => {
        if (value && value !== 'default') formData[name] = value;
    });
    return formData;
}

function showNotify(message, type){
    const icon = type === 'success' ? 'glyphicon glyphicon-ok' : 'glyphicon glyphicon-warning-sign'

    $.notify(
        {
            // options
            icon: icon,
            title: '',
            message: message
        },
        {
            type: type
        }
    );
}

function rebuildCarousel(selector) {
    selector.trigger('destroy.owl.carousel');
    selector.owlCarousel();
    return true;
}

function addAndRefreshCarousel(selector, elem){
    selector.trigger('add.owl.carousel', elem);
    selector.trigger('refresh.owl.carousel');
    return true;
}