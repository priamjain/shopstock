const mongoose = require('mongoose');
const orderSchema = new mongoose.Schema({
	byUser:{type:mongoose.Schema.Types.ObjectId,ref:'User'},
	content: 'String',
	forBusiness:{type:mongoose.Schema.Types.ObjectId,ref:'Business'},
	done:'Boolean'
});

module.exports = mongoose.model('Order', orderSchema);