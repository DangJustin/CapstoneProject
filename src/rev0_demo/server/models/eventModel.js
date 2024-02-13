// Import the Mongoose library for MongoDB interaction
const mongoose = require('mongoose');

// Define a user schema using Mongoose's Schema class
const eventSchema = new mongoose.Schema({
    eventname: {
        type: String,
        required: true,
    },
    datetime: {
        type: Date,
        required: true,
    },
    minutes: {
        type: Number,
        required: true,
    },
    groupID: {
        type: mongoose.Schema.Types.ObjectId,,
        required: true,
    }
});

// Create a Mongoose model named 'Event' using the userSchema
const Event = mongoose.model('event', eventSchema);

module.exports = Event;