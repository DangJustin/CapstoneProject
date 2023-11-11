const mongoose = require('mongoose');

const groupSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  // Reference to the User model
  users: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'user'
  }]
});

const Group = mongoose.model('Group', groupSchema);

module.exports = Group;
