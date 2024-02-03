// Import the Mongoose library for MongoDB interaction
const mongoose = require('mongoose');

// Define a user schema using Mongoose's Schema class
const userSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
        unique: true,
    },
    username: {
        type: String,
        required: true,
        unique: true,
    },
    firstname: {
        type: String,
        required: true,
    },
    lastname: {
        type: String,
        required: true,
    },
    phone: {
        type: String,
        required: true,
    }
});

// Create a Mongoose model named 'User' using the userSchema
const User = mongoose.model('user', userSchema);

module.exports = User;
