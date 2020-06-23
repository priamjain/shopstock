const mongoose = require('mongoose');
const orderSchema = new mongoose.Schema({
	byUser:{type:mongoose.Schema.Types.ObjectId,ref:'User'},
	content: 'String',
	forBusiness:{type:mongoose.Schema.Types.ObjectId,ref:'Business'},
	done:{type:'Boolean',default:false}
});

module.exports = mongoose.model('Order', orderSchema);