const mongoose = require('mongoose');
const passportLocalMongoose = require('passport-local-mongoose');
 
const userSessionSchema = new mongoose.Schema({
	userId : {
		type: String,
		default: ""
	},
	timestamp: {
		type: Date,
		default: Date.now()
	},
	isDeleted: {
		type: Boolean,
		default: false
	}
});

module.exports = mongoose.model('UserSession', userSessionSchema);