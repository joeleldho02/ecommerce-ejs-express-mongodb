const mongoose = require('mongoose');

//-----   Order Model   -----//
const orderSchema = new mongoose.Schema({
    orderId: String,
    customerId: mongoose.Schema.Types.ObjectId,
    products: [{
        productId: mongoose.Schema.Types.ObjectId,
        productName: String,
        category: String,
        quantity: Number,
        salePrice: Number
    }],
    paymentMethod : String,
    paymentStatus: {
        type : String,
        default: "PENDING"
    },
    shippingMethod: {
        type : String,
        default: "Post Mail Courier"
    },
    shippingCost: {
        type : Number,
        default: 0
    },
    totalItems : Number,
    totalAmount : Number,
    discount: Number,
    shippingAddress : {},
    orderStatus: {
        type : String,
        default: "PENDING"
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