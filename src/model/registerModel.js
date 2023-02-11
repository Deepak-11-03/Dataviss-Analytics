const mongoose = require('mongoose')

const register = new mongoose.Schema({
    firstName:{type:String,required:true},
    middleName:{type:String,required:true},
    lastName:{type:String,required:true},
    email:{type:String,required:true},
    password:{type:String,required:true},
    role:{type:String,required:true},
    department:{type:String,required:true},
},{timestamps:true})

module.exports = mongoose.model('Register' ,register)