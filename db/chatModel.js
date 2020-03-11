const mongoose = require('mongoose')
const Schema = mongoose.Schema
const chatSchema = new Schema({
  from: {type: String, required: true},//发送方id
  to: {type: String, required: true},//接受方id
  chat_id: {type: String, required: true},//会话id
  content: {type: String, required: true},//内容
  read: {type: Boolean, default: false},//是否已读
  create_time: {type: Number}//创建回话时间
})
exports.chatModel = mongoose.model('Chat', chatSchema) //集合
