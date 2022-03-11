
// Require mongoose
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// Create a new schema. 
const userSchema = new Schema({
    username: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    admin: {
        type: Boolean,
        default: false
    }
});

// Export the model (1st argument is the name "User" and the colloection will automatically be named "users" lowercase, 2nd argument, is the schema to use which is "userSchema")
module.exports = mongoose.model('User', userSchema);
