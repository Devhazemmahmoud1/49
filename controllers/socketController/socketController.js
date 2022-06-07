const express = require('express')
var socketio = require("socket.io");

var sockets = []

// io.on('connection', async (socket) => {
//   if (socket.handshake.headers.authorization) {
//     sockets.push({
//       socket_id: socket.id,
//       user_id: socket.user.id,
//     })
//   }

//   socket.on('disconnect', () => {
//     console.log(socket.id + ' is out from here')
//     sockets.filter( (removedElem) => {
//       return removedElem.socket_id != socket.id
//     })
//     console.log(sockets)
//   })
// })

module.exports = { sockets }
