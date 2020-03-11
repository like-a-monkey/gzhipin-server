var http = require('http')
var server = http.createServer()
require('./socket')(server)
server.listen(4000 , function(){
  console.log('server is running')
})
