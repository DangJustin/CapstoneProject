const User = require("../models/userModel");
const Bill = require("../models/billModel");
const Group = require("../models/groupModel");
const UserDebt = require("../models/userDebtModel");

const splitExpense = async ({
  userID,
  amount,
  description,
  participants,
  groupID,
  individualAmounts // Added parameter for individual expense amounts
}) => {
  try {
    // Find the user initiating the expense (User A)
    const userA = await User.findOne({ userID: userID });
    if (!userA) {
      throw new Error("User not found");
    }

    // Check if the group exists
    let group;
    if (groupID) {
      group = await Group.findById(groupID);
      if (!group) {
        throw new Error("Group not found");
      }
    }

    if (!individualAmounts) {
      individualAmounts = Array.from({ length: participants.length }, () => amount / (participants.length + 1));
    }

    // Create a new bill
    const newBill = new Bill({
      totalAmount: amount,
      users: [
        {
          user: userA._id,
          amountOwed: amount - (individualAmounts.reduce((acc, val) => acc + parseFloat(val), 0)), // Adjusted amount owed for User A
        },
      ],
      group: groupID || null,
    });

    // Add participants to the bill
    await Promise.all(
      participants.map(async (participantID, index) => {
        const participant = await User.findById(participantID);
        if (participant) {
          newBill.users.push({
            user: participant._id,
            amountOwed: parseFloat(individualAmounts[index]), // Use individual amount for each participant
          });

          // Add the bill's ID to the participant's bills field
          participant.bills.push(newBill._id);
          await participant.save();

          await UserDebt.findOneAndUpdate(
            { from: userA._id, to: participant._id },
            { $inc: { amount: parseFloat(individualAmounts[index]) } }, // Increment debt amount by individual amount
            { upsert: true }
          );
        }
      })
    );

    userA.bills.push(newBill._id);
    await userA.save();

    // Save the bill
    await newBill.save();

    // Update user's amount
    userA.amount += (individualAmounts.reduce((acc, val) => acc + parseFloat(val), 0)); // Adjust user's amount
    await userA.save();

    // Update participants' amounts
    await Promise.all(
      participants.map(async (participantID, index) => {
        const participant = await User.findById(participantID);
        if (participant) {
          participant.amount -= parseFloat(individualAmounts[index]); // Subtract individual amount from participant's amount
          await participant.save();
        }
      })
    );

    return { success: true, message: "Expense added successfully" };
  } catch (error) {
    // console.error("Error adding expense:", error);
    throw new Error("Internal Server Error");
  }
};

module.exports = {
  splitExpense,
};
