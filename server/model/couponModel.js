const mongoose = require('mongoose');
const moment = require('moment-timezone');

//-----   Category Model   -----//
const couponSchema = new mongoose.Schema({
    couponCode: String,
    description: String,
    discount: Number,
    minAmount: Number,
    maxDiscount: Number,
    isDeleted:{
        type: Boolean,
        default: false
    },
    isListed:{
        type: Boolean,
        default: true
    },
    createdAt: {
        type: Date,
        default: () => Date.now()
    }
});
const Coupondb = mongoose.model('coupon', couponSchema);

module.exports = Coupondb;