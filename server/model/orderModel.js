const mongoose = require('mongoose');
const moment = require('moment-timezone');

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
        type: String,
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
        default: () => moment.tz(Date.now(), "Asia/Kolkata")
    },
    updatedAt:{
        type: Date,
        default: () => moment.tz(Date.now(), "Asia/Kolkata")
    }
});

const Orderdb = mongoose.model('order', orderSchema);

module.exports = Orderdb;