$(document).ready(function(){
    var userData = JSON.parse($('#userData').text());
    console.log(userData);
    if (typeof(Storage) !== "undefined") {
        var stored_account_id = sessionStorage.getItem("user_id")
        if (stored_account_id == null){
            // Store
            sessionStorage.setItem("user_id", userData.user_id);
            sessionStorage.setItem("permissions", userData.permissions);
        }
    } else {
        //document.getElementById("result").innerHTML = "Sorry, your browser does not support Web Storage...";
        console.log("Sorry, your browser does not support Web Storage...");
    }

    var userPermissions = sessionStorage.getItem("permissions");
    var permissions = {revenue:true, remittance:true}
    if (permissions.revenue) {
        $('#revenueCard').removeClass('d-none');
    }

    if (permissions.remittance) {
        $('#dailyCollections').removeClass('d-none');
    }

});