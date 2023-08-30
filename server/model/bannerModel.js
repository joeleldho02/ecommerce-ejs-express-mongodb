const mongoose = require('mongoose');

//-----   Category Model   -----//
const bannerSchema = new mongoose.Schema({
    title: {
		type: String
	},
	description: {
		type: String
	},
	image: {
		type: String
	},
	location: {
		type: String
	},
	link: {
		type: String
	},
	isActive: {
		type: Boolean,
        default: true
	},
});
const Bannerdb = mongoose.model('banner', bannerSchema);

module.exports = Bannerdb;