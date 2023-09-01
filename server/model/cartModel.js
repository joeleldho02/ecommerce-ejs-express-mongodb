const mongoose = require('mongoose');
const moment = require('moment-timezone');

//-----   Cart Model   -----//
const cartSchema = new mongoose.Schema({
    customerId: mongoose.Schema.Types.ObjectId,
    products: [{
        productId: mongoose.Schema.Types.ObjectId,
        quantity: Number,
    }],
    createdAt: {
        type: Date,
        default: () => Date.now()
    },
    updatedAt:{
        type: Date,
        default: () => Date.now()
    }
});
const Cartdb = mongoose.model('cart', cartSchema);

module.exports = Cartdb;