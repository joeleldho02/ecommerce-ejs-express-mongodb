const mongoose = require('mongoose');

//-----   Order Model   -----//
const orderSchema = new mongoose.Schema({
    orderId: String,
    customerId: mongoose.Schema.Types.ObjectId,
    products: [{
        productId: {
            type : mongoose.Schema.Types.ObjectId
        },
        productName: String,
        category: String,
        quantity: Number,
        salePrice: Number,
        productImage: String
    }],
    paymentMethod : String,
    paymentStatus: {
        type : String,
        default: "PENDING"
    },
    paymentDetails:{
        type: Object
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
    finalAmount: {
		type: Number,
		default: 0,
	},
    coupon:{
        couponText: String,
        amount: Number
    },
    discount: {
		type: Number,
		default: 0,
	},
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