const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const passportLocalMongoose = require('passport-local-mongoose');
 
const userSchema = new mongoose.Schema({
	username:String,
	email:String,
	password:String
});
 
userSchema.plugin(passportLocalMongoose);
 
module.exports = mongoose.model('User', userSchema);