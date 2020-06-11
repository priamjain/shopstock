const mongoose = require('mongoose');
const passportLocalMongoose = require('passport-local-mongoose');
 
const bussinessSchema = new mongoose.Schema({
	name:String,
	address:String,
	landmark:String,
	pincode:String,
	days:{
		SUN:Boolean,
		MON:Boolean,
		TUE:Boolean,
		WED:Boolean,
		THY:Boolean,
		FRI:Boolean,
		SAT:Boolean
	}
});
 
userSchema.plugin(passportLocalMongoose,{usernameField:"email"});
 
module.exports = mongoose.model('User', userSchema);