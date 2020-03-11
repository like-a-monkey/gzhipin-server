const mongoose = require('mongoose')
var Schema = mongoose.Schema
var userSchema = new Schema({
  username: {type: String, require: true},
  password: {type: String, require: true},
  type: {type: String, required: true},
  header: {type: String}, //头像名称
  post: {type: String}, //职位
  info: {type: String}, //个人简介
  company: {type: String}, //公司
  salary: {type: String} // 工资
})

exports.userModel = mongoose.model('User', userSchema) //集合