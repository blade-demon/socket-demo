const app = require('express')();
const http = require('http').Server(app);
const io = require('socket.io')(http);

const nsp_client = io.of('/client');
const nsp_server = io.of('/server');

let clientArray = [];

app.get('/', function(req, res) {
    res.sendFile(__dirname + "/index.html");
});

app.get('/admin', function(req, res) {
    res.sendFile(__dirname + "/admin.html");
});

nsp_client.on('connection', function(socket){
    console.log('one client connected');
    clientArray.push(socket.id);
    console.log("当前已经登录的客户端是：", clientArray);
    socket.emit('login', `machine ${socket.id} connected`);
    nsp_server.emit('clientLogin', getClientList());

    socket.on('disconnect', function(){
        console.log(`${socket.id} disconnected`);
        clientArray = clientArray.filter(clientId => clientId !== socket.id);
        // 向server namespace 发送消息
        nsp_server.emit('clientLogout', getClientList());
    });
});

nsp_server.on('connection', function (socket) {
   console.log('server connected');

   socket.emit('login', getClientList());

   // io.emit('clientLogin', getClientList());
   // io.emit('clientLogout', getClientList());

   socket.on('disconnect', function () {
       console.log('server disconnected');
   })
});

// 获得客户端列表
var getClientList = () => clientArray;

http.listen(3000, function () {
    console.log("Server is running on port 3000.")
});