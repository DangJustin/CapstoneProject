// Import the Mongoose library for MongoDB interaction
const mongoose = require('mongoose');

// Define a user schema using Mongoose's Schema class
const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
  },
  group: {
    type: String,
    default: ''
  },
  amount: {
    type: Number,
    default: 0.0
  }
});

// Create a Mongoose model named 'User' using the userSchema
const User = mongoose.model('user', userSchema);

module.exports = User;
