// Import the Mongoose library for MongoDB interaction
const mongoose = require('mongoose');

// Define a user schema using Mongoose's Schema class
const userSchema = new mongoose.Schema({
    userID: {
        type: String,
        required: false,
        unique: true,
    },
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
    },
    lastname: {
        type: String,
    },
    phone: {
        type: String,
    },
    amount: {
        type: Number,
        default: 0.0
    },
    bills: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'bills'
      }]
});

// Create a Mongoose model named 'User' using the userSchema
const User = mongoose.model('user', userSchema);

module.exports = User;