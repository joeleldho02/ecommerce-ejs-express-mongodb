const mongoose = require('mongoose');

//-----   Category Model   -----//
const walletSchema = new mongoose.Schema({
});
const Walletdb = mongoose.model('wallet', walletSchema);

module.exports = Walletdb;