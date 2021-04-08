$(document).ready(function(){
   console.log('11111111111111111111');
    const webSocketBridge = new WebSocket(
        'ws://'
        + window.location.host
        + '/ws'
    );

    console.log(webSocketBridge);

    webSocketBridge.onmessage = function(e) {
        const data = JSON.parse(e.data);
        console.log(data);
    };

    webSocketBridge.onerror = function(e) {
        console.log(e)
        console.error('an error occured');
    };

    webSocketBridge.onclose = function(e) {
        console.log(e)
        console.error('socket closed unexpectedly');
    };

    // webSocketBridge.send(JSON.stringify({
    //     'message': 'Testing out channels'
    // }));

    // webSocketBridge.send("testing 1 2 3 ");

   // webSocketBridge.connect('/ws/');
   // webSocketBridge.listen(function (action, stream){
   //     console.log("RESPONSE:", action, stream);
   // });
    console.log('11111111111111111111');
});