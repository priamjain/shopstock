const mongoose = require('mongoose');
const passportLocalMongoose = require('passport-local-mongoose');
 
const userSchema = new mongoose.Schema({
	username:String,
	email:String,
	password:String,
	bussiness:[{ type: mongoose.Schema.Types.ObjectId, ref: 'Bussiness' }]
});
 
userSchema.plugin(passportLocalMongoose,{usernameField:"email"});
 
module.exports = mongoose.model('User', userSchema);