$(document).ready(() => {
    console.log("WS3005 JS CONNECTED!");
    const ws = new WebSocket("ws://192.168.0.55:3006");
    ws.onopen = () => {
        console.log("Client -> Server Socket Connected");
        ws.send("Client WS3005");
    }
    ws.onmessage = (message) => {
        console.log("Server Message: " + message.data); //message.data 사용!
    }
});

//btn server send
$("#client_send").click(()=>{
    let send_data_object = {};
    send_data_object.orderNo = $("#client_orderNo").val(); // 객체를 만들어 추가하는 방식이다.
    send_data_object.items = $("#client_items").val();// .items 가 Key가 된다.
    send_data_object.itemNo = $("#client_itemNo").val();
    send_data_object.lotNo = $("#client_lotNo").val();
    send_data_object.productDate = $("#client_productDate").val();
    send_data_object.containerNo = $("#client_containerNo").val();

    $.ajax({
        url:"http://192.168.0.55:3006/ClientData",
        timeout: 0,
        type: "POST",
        contentType: "application/json",
        data: JSON.stringify(send_data_object),
        success: function(response){
            console.log(response);
        },
        error: function(xhr, status, error){
            console.error(error);
        }
    })
});