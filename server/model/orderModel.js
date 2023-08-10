const mongoose = require('mongoose');

//-----   Order Model   -----//
const orderSchema = new mongoose.Schema({
    customerId: mongoose.Schema.Types.ObjectId,
    products: [{
        productId: mongoose.Schema.Types.ObjectId,
        quantity: Number,
        amount: Number
    }],
    paymentMethod : String,
    shippingMethod: String,
    totalAmount : Number,
    shippingAddress : {},
    status: {
        type : String,
        default: () => "PENDING"
    },
    createdAt: {
        type: Date,
        default: () => Date.now()
    },
    updatedAt:{
        type: Date,
        default: () => Date.now()
    }
});
const Orderdb = mongoose.model('order', orderSchema);

module.exports = Orderdb;