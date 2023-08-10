const mongoose = require('mongoose');

//-----   Category Model   -----//
const paymentSchema = new mongoose.Schema({
    paymentName:{
        type: String,
        required: true
    },
    description: {
        type: String
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
const Paymentdb = mongoose.model('payment', paymentSchema);

module.exports = Paymentdb;