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

module.exports = Admindb;