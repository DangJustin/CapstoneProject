const mongoose = require('mongoose');

const userDebtSchema = new mongoose.Schema({
  from: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'user',
    required: true
  },
  // Reference to the User model
  to: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'user',
    required: true
  },
  amount: {
    type: Number,
    default: 0,
  }
});

const UserDebt = mongoose.model('UserDebt', userDebtSchema);

module.exports = UserDebt;
