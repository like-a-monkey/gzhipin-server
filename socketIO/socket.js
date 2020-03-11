const { chatModel } = require('../db/chatModel')


module.exports = function (serve) {
  const io = require('socket.io')(serve)
  io.on('connection', function (socket) {
    socket.on('sendMsg', function (data) {
      console.log('收到客户端信息', data)
      const {from, to, content} = data
      const chat_id = [from, to].sort().join('-')
      let create_time =Date.now()
      new chatModel({from, to, content, chat_id, create_time}).save(function(err, data) {
        console.log(data)
        io.emit('response', data)
        console.log('服务器向客户端发送消息')
      })

    })
  })
}

