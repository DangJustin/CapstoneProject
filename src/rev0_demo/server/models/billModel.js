const mongoose = require("mongoose");

const billSchema = new mongoose.Schema({
  date: {
    type: Date,
    default: Date.now,
  },
  billName: {
    type: String,
    required: true,
  },
  totalAmount: {
    type: Number,
    required: true,
  },
  // Reference to the User model for the payer
  users: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
      required: true,
    },
    amountOwed: {
      type: Number,
      required: true,
    },
  }],
  // Reference to the Group model
  group: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Group",
    required: false,
  },
  category: {
    type: String,
    required: false,
    default: "Uncategorized"
  }
});

const Bill = mongoose.model("Bill", billSchema);

module.exports = Bill;
