const mongoose = require('mongoose');
const Schema = mongoose.Schema;

require('mongoose-currency').loadType(mongoose);
const Currency = mongoose.Types.Currency;

// Comment schema
const commentSchema = new Schema({
    rating: {
        type: Number,
        min: 1,
        max: 5,
        required: true
    },
    // store the text of the comment
    text: {
        type: String,
        required: true
    },
    author: {
        type: String,
        required: true
    }
}, {
    timestamps: true
});


const campsiteSchema = new Schema({
    name: {
        type: String,
        required: true,
        unique: true    
    },
    description: {
        type: String,
        required: true
    },
    image: {
        type: String,
        required: true
    },
    elevation: {
        type: Number,
        required: true
    },
    // added the cost field and this is where we use the type of currency
    cost: {
        type: Currency,
        required: true,
        min: 0
    },
    featured: {
        type: Boolean,
        default: false
    },
    // add a comments property - give it an array with the comments schema in it. this will caise every campsite document to contain multiple comment documents stored within an array
    comments: [commentSchema]
}, {
    timestamps: true
});

// Create a model named "Campsite" - always capitalize - first arugument should always be a capitalized singular name, then add in the name of the schema as created above
const Campsite = mongoose.model('Campsite', campsiteSchema);


// export the Campsite model
module.exports = Campsite;