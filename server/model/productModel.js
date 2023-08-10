const mongoose = require('mongoose');

//-----   Product Model   -----//
const productSchema = new mongoose.Schema({
    productName:{
        type: String,
        required: true
    },
    description: String,
    category:{
        type: mongoose.Schema.Types.ObjectId,
        required: true
    },
    brand: String,
    regularPrice: Number,
    salePrice:  Number,
    stock: Number,
    rating:  Number,
    images: [],
    review: [],    
    isDeleted:{
        type: Boolean,
        default: false
    },
    createdAt: {
        type: Date,
        default: () => Date.now()
    }
});
const Productdb = mongoose.model('product', productSchema);

module.exports = Productdb;