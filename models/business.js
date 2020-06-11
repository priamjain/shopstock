const mongoose = require('mongoose');
const searchable = require('mongoose-regex-search'); 
const businessSchema = new mongoose.Schema({
	owner:{ type: mongoose.Schema.Types.ObjectId, ref: 'User' },
	name:{type:String,searchable:true},
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
businessSchema.plugin(searchable);
 
 
module.exports = mongoose.model('Business', businessSchema);