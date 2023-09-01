const mongoose = require('mongoose');
const moment = require('moment-timezone');

//-----   Category Model   -----//
const categorySchema = new mongoose.Schema({
    categoryName:{
        type: String,
        required: true
    },
    description: {
        type: String
    },
    slug: {
        type: String
    },
    isListed:{
        type: Boolean,
        required: true
    },
    isDeleted:{
        type: Boolean,
        default: false
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
const Categorydb = mongoose.model('category', categorySchema);

module.exports = Categorydb;