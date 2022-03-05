const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// Partner schema
const partnerSchema = new Schema({
    // store the name of the partner
    name: {
        type: String,
        required: true,
        unique: true 
    },
    // image
    image: {
        type: String,
        required: true
    },
    featured: {
        type: Boolean,
        required: false
    },
    description: {
        type: String,
        required: true
    },
}, {
    timestamps: true
});

const Partner = mongoose.model('Partner', partnerSchema);

module.exports = Partner;