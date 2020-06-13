const mongoose = require('mongoose');
const passportLocalMongoose = require('passport-local-mongoose');
const bcrypt = require('bcrypt');
 
const userSchema = new mongoose.Schema({
	firstname:String,
	lastname:String,
	email:String,
	password:String,
	isDeleted: {
		type: Boolean,
		default: false
	},
	business:[{ type: mongoose.Schema.Types.ObjectId, ref: 'Business' }]
});

userSchema.methods.generateHash = function(password){
	return bcrypt.hashSync(password, bcrypt.genSaltSync(8), null);
}

userSchema.methods.validPassword = function(password){
	return bcrypt.compareSync(password, this.password);
}
 
module.exports = mongoose.model('User', userSchema);