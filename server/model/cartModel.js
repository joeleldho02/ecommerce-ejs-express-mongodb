const mongoose = require('mongoose');

//-----   Cart Model   -----//
const cartSchema = new mongoose.Schema({
    customerId: mongoose.Schema.Types.ObjectId,
    products:[{
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