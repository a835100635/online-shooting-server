//https://github.com/socketio/socket.io
//与express结合
//注意跨域问题
const express = require("express");
const app = express();
const server = require("http").createServer(app);
// cors 一定要开启跨预
const io = require("socket.io")(server, { cors: true });

const allClient = new Map();

const dataMap = () => {
  const result = {};
  allClient.forEach((item) => {
    result[item.sid] = item
  })
  return result;
}

io.on("connection", client => {
  console.log("connection 连接成功 ===>", client.id);

  const ids = [];
  client.nsp.sockets.forEach(element => {
    ids.push(element.id);
  });
  console.log("总连接 ids --->", JSON.stringify(ids), allClient);

  // 接收到的玩家信息
  client.on('update_player', data => {
    console.log('player 更新 --->', JSON.stringify(data));
    allClient.set(data.sid, data);

    // 广播
    client.broadcast.emit('_update', dataMap());
  })

  // 接收到的子弹信息
  client.on('update_bullet', data => {
    console.log('bullet --->', JSON.stringify(data));
    // 广播
    client.broadcast.emit('_update_bullet', JSON.parse(JSON.stringify(data)));
  })

  client.on('delete_bullet', bulletId => {
    console.log('delete_bullet --->', bulletId);
    // 广播
    client.broadcast.emit('_delete_bullet', bulletId);
  });

  // 断开连接
  client.on('disconnect', data => {
    console.log(`disconnect 断开连接 ===>`, client.id);

    // 删除断开连接的玩家
    allClient.delete(client.id);

    // 广播
    client.broadcast.emit('_update', dataMap());
  });
});




let ws = server.listen(3000, function () {
    console.log('start at port: localhost:' + ws.address().port);
});

