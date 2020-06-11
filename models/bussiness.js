const mongoose = require('mongoose');
 
const bussinessSchema = new mongoose.Schema({
	owner:{ type: mongoose.Schema.Types.ObjectId, ref: 'User' },
	name:String,
	address:String,
	landmark:String,
	pincode:String,
	days:{
		SUN:Boolean,
		MON:Boolean,
		TUE:Boolean,
		WED:Boolean,
		THU:Boolean,
		FRI:Boolean,
		SAT:Boolean
	}
});
 
 
module.exports = mongoose.model('Bussiness', bussinessSchema);