const mongoose = require('mongoose');

//-----   Admin Model   -----//
const adminSchema = new mongoose.Schema({
    name:{
        type: String,
        required: true
    },
    phone: String,
    email:{
        type: String,
        required: true
    },
    password: {
        type: String,
        required:true
    }
});
const Admindb = mongoose.model('admin', adminSchema);

//-----   User Model   -----//
const userSchema = new mongoose.Schema({
    firstName:{
        type: String,
        required: true
    },
    lastName:{
        type: String
    },
    email:{
        type: String,
        required: true
    },    
    phone: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required:true
    },
    isActive: {
        type: Boolean,
        default: () => true
    },
    address:[],
    cart:[],
    wishlist :[],
    createdAt: {
        type: Date,
        default: () => Date.now()
    },
    updatedAt:{
        type: Date,
        default: () => Date.now()
    }
});
const Userdb = mongoose.model('user', userSchema);

//-----   Category Model   -----//
const categorySchema = new mongoose.Schema({
    categoryName:{
        type: String,
        required: true
    },
    description: {
        type: String
    },
    isListed:{
        type: Boolean,
        required: true
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
    quantity: Number,
    rating:  Number,
    images: [],
    review: [],
    createdAt: {
        type: Date,
        default: () => Date.now()
    }
});
const Productdb = mongoose.model('product', productSchema);

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

//-----   Order Model   -----//
const orderSchema = new mongoose.Schema({
    customerId: mongoose.Schema.Types.ObjectId,
    cartId: mongoose.Schema.Types.ObjectId,
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

//-----   Wallet Model   -----//
//-----   Coupon Model   -----//
//-----   Banner Model   -----//


module.exports = {
    Userdb,
    Admindb,
    Categorydb,
    Productdb,
    Cartdb
};