const mongoose = require('mongoose');

const userStreakSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'user',
    required: true
  },
  currentStreak: {
    type: Number,
    default: 0
  },
  maxStreak: {
    type: Number,
    default: 0
  }
});

const UserStreak = mongoose.model('UserStreak', userStreakSchema);

module.exports = UserStreak;
