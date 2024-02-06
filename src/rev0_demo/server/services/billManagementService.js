const User = require("../models/userModel");
const Bill = require("../models/billModel");
const Group = require("../models/groupModel");

const splitExpense = async ({
  userID,
  amount,
  description,
  participants,
  groupID,
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

    // Create a new bill
    const newBill = new Bill({
      totalAmount: amount,
      users: [
        {
          user: userA._id,
          amountOwed: amount - amount / (participants.length + 1),
        },
      ],
      group: groupID || null,
    });

    // Add participants to the bill
    await Promise.all(
      participants.map(async (participantID) => {
        const participant = await User.findById(participantID);
        if (participant) {
          newBill.users.push({
            user: participant._id,
            amountOwed: amount / (participants.length + 1),
          });

          // Add the bill's ID to the participant's bills field
          participant.bills.push(newBill._id);
          await participant.save();
        }
      })
    );

    // Save the bill
    await newBill.save();

    // Update user's amount
    userA.amount += amount - (amount / (participants.length + 1));
    await userA.save();

    // Update participants' amounts
    await Promise.all(
      participants.map(async (participantID) => {
        const participant = await User.findById(participantID);
        if (participant) {
          participant.amount -= amount / (participants.length + 1);
          await participant.save();
        }
      })
    );
    // If the bill is associated with a group, update group details IF NEEDED

    return { success: true, message: "Expense added successfully" };
  } catch (error) {
    console.error("Error adding expense:", error);
    // Assuming an error occurred
    throw new Error("Internal Server Error");
  }
};

module.exports = {
  splitExpense,
};
