$(document).ready(function(){
    const aCsrfToken = $.cookie('csrftoken');
    $( document ).ajaxSend(function( event, xhr, settings ) {
        xhr.setRequestHeader('X-CSRFToken', aCsrfToken)
    });
});
