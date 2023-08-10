const mongoose = require('mongoose');

//-----   Category Model   -----//
const bannerSchema = new mongoose.Schema({
});
const Bannerdb = mongoose.model('banner', bannerSchema);

module.exports = Bannerdb;