
// Require mongoose
const mongoose = require('mongoose');

// Import passport plugin
// plugin will handle the username and password fields and provide additional authentication methods
const passportLocalMongoose = require('passport-local-mongoose');

const Schema = mongoose.Schema;

// Create a new schema. 
const userSchema = new Schema({
    firstname: {
        type: String,
        default: ''
    },
    lastname: {
        type: String,
        default: ''
    },
    facebookId: String,
    admin: {
        type: Boolean,
        default: false
    }
});

userSchema.plugin(passportLocalMongoose);


// Export the model (1st argument is the name "User" and the collection will automatically be named "users" lowercase, 2nd argument, is the schema to use which is "userSchema")
module.exports = mongoose.model('User', userSchema);
