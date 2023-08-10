const mongoose = require('mongoose');

//-----   Category Model   -----//
const couponSchema = new mongoose.Schema({
});
const Coupondb = mongoose.model('coupon', couponSchema);

module.exports = Coupondb;