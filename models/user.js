const mongoose = require('mongoose');
const passportLocalMongoose = require('passport-local-mongoose');
 
const userSchema = new mongoose.Schema({
	firstname:String,
	lastname:String,
	email:String,
	password:String,
	businesses:[{ type: mongoose.Schema.Types.ObjectId, ref: 'Business' }],
	completedOrders:[{type: mongoose.Schema.Types.ObjectId, ref:'Orders'}],
	pendingOrders:[{type: mongoose.Schema.Types.ObjectId, ref:'Orders'}]
});
 
userSchema.plugin(passportLocalMongoose,{usernameField:"email"});
 
module.exports = mongoose.model('User', userSchema);