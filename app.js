const http = require('http')
const express = require('express')
const app = express()
const server = http.createServer(app)
const mongoose = require('mongoose')
const bodyParser = require('body-parser')
const md5 = require('blueimp-md5')
const { userModel } = require('./db/userModel')
const { chatModel } = require('./db/chatModel')
const cookieParser = require('cookie-parser');
const filter = {password: 0, __v: 0}
require('./socketIO/socket')(server)
mongoose.connect('mongodb://localhost/test')
const conn = mongoose.connection
conn.on('connected', function(){
  console.log('connected')
})
// 连接验证 需要提前开启数据库
app.use(cookieParser()); //使用cookie中间件，传入签名123456进行加密
app.use('/pulic/',express.static('./public/'))
// 开放public资源
app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())
// 设置body-parser中间件 方便解析post数据 

app.post('/register',function (req, res) {
  const {username, password, type} = req.body
  userModel.findOne({username},function(err, user){
    if(user){
      res.send({code: 1, msg: '用户已存在'})
    }
    else{
      var user = new userModel({username, password: md5(password), type})
      user.save(function(err, user){
        if(err){
          res.send({code: 1, msg:err.message})
        }
        res.cookie('userid', user._id, {maxAge: 1000*60*60*24 })//设置cookie
        res.send({code: 0, data: {_id:user._id, username, type}})

      })
    }
  })
})

app.post('/login', function (req, res) {
  const {username, password} = req.body
  userModel.findOne({username, password: md5(password)},function(err, user){
    if(!user){
      res.send({code:1 ,msg: '密码或用户名错误'})
    }
    else{
      //登陆成功
      res.cookie('userid', user._id, {maxAge: 1000*60*60*24})
      const data = {_id: user._id, username: user.username, type: user.type}
      user.header && (data.header=user.header)
      res.send({code: 0, data})
    }
  })
})

app.post('/update', function (req, res) {
  const {userid} = req.cookies
  if(!userid){
    return res.send({code: 1, msg: '请先登陆'})
  }
  const data = req.body
  const {header, info, post, company, salary} = data
  userModel.findByIdAndUpdate(userid, {header, info, post, company, salary}, function(err, doc) {
    //doc为被id匹配的那一项(未修改)
    if(!doc){
      res.clearCookie('userid')
      //cookie有可能被恶意篡改，最好清除
      res.send({code: 1, msg: '请先登陆'})
    } else {
      const {_id, username, type} = doc
      res.send({code: 0, data: {_id, username, type, ...data}})
    }
  })
})
app.get('/user', function(req, res) {
  const {userid} = req.cookies
  if(!userid){
    return res.send({code: 1, msg: '请先登录'})
  }
  userModel.findById(userid, filter, function(err, user) {
    if(!user){
      return res.clearCookie('userid')
    //  无效userid 通知服务器清除
    }
    res.send({code: 0, data: user})
  })
})

app.get('/userlist', function(req, res) {
  const {type} = req.query
  userModel.find({type}, filter, function(err, data) {
    res.send({code: 0, data})
  })
})

app.get('/msglist', function(req, res) {
  const from = req.cookies.userid
  const users = {}
  userModel.find(function(err, userDocs){
    userDocs.forEach((user, index) => {
      users[user._id] = {
        username: user.username,
        header: user.header
      }
    })
    chatModel.find({'$or': [{from}, {to: from}]}, filter, function (err, chatMsgs) {
      res.send({code: 0, data: {users, chatMsgs}})
    })
  })
})

app.post('/readmsg', function(req, res) {
  const {from}= req.body
  const to = req.cookies.userid
  chatModel.updateMany({from, to, read: false},{read: true}, function(err, doc) {
    res.send({code: 0, data: doc.nModified})
  //  发送更新数量
  })
})

server.listen(4000, function() {
  console.log('server is running')
})
