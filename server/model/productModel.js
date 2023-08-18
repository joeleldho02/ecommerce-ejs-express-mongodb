const mongoose = require('mongoose');

//-----   Product Model   -----//
const productSchema = new mongoose.Schema({
    productName:{
        type: String,
        required: true
    },
    SKU: String,
    shortDescription: String,
    description: String,
    category:{
        type: mongoose.Schema.Types.ObjectId,
        required: true
    },
    brand: String,
    regularPrice: Number,
    salePrice:  Number,
    taxRate: Number,
    stock: Number,
    rating:  Number,
    images: [],
    tags: [],
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