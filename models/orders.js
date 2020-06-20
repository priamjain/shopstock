const mongoose = require('mongoose');
const orderSchema = new mongoose.Schema({
	by:{type:mongoose.Schema.Types.ObjectId,ref:'User'},
	contents: 'String',
	for:{type:mongoose.Schema.Types.ObjectId,ref:'Bussiness'}
});

module.exports = mongoose.model('Order', orderSchema);