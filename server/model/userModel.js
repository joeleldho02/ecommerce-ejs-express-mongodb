const mongoose = require('mongoose');

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
    address:[{
        customerName: String,
        addressLine1 : String,
        addressLine2 : String,
        city : String,
        state : String,
        country : String,
        pincode : String,
        email : String,   
        phone : String,
        notes : String,
        isDefault: {
            type: Boolean,
            default: () => false
        }     
    }],
    cart: {
        type: Array
    },
    wishlist :[ mongoose.Schema.Types.ObjectId ],
    createdAt: {
        type: Date,
        default: () => Date.now()
    },
    updatedAt:{
        type: Date,
        default: () => Date.now()
    },
    wallet:[{
        amount: Number,
        timestamp: Date,
        type: String
    }]
});
const Userdb = mongoose.model('user', userSchema);

module.exports = Userdb;