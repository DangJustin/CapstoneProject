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

const deleteExpense = async (billId) => {
  const billDetails = await Bill.findById(billId);
  const firstUserId = billDetails.users[0].user;

  // Iterate through each user in the bill's user list
  for (const [index, user] of billDetails.users.entries()) {
    if (index === 0) {
      // Update the amount for the first user
      await User.findOneAndUpdate(
        { _id: user.user },
        { $inc: { amount: -user.amountOwed } }
      );
    } else {
      // For other users, update their amount owed
      await User.findOneAndUpdate(
        { _id: user.user },
        { $inc: { amount: user.amountOwed } }
      );

      await UserDebt.findOneAndUpdate(
        { from: firstUserId, to: user.user },
        { $inc: { amount: -user.amountOwed } }
      );
    }

    // Delete the bill ID from the user's bills array
    await User.findOneAndUpdate(
      { _id: user.user },
      { $pull: { bills: billId } }
    );
  }

  try {
    // Find the bill by ID and delete it
    const deletedBill = await Bill.findByIdAndDelete(billId);

    if (!deletedBill) {
      // Return a value to indicate that the bill was not found
      return { error: "Bill not found" };
    }

    // Return a value to indicate that the deletion was successful
    return { message: "Bill deleted successfully" };

  } catch (error) {
    // Log the error and rethrow it to be caught in the controller
    console.error("Error deleting bill:", error);
    throw error;
  }
}

const getExpenses = async (userId) => {
  try {
    // Find the user by ID
    const user = await User.findOne({ userID: userId });
    if (!user) {
      return { error: "User not found" }; // Return an object with an error property
    }

    const bills = await Bill.find({ "users.user": user })
      .populate("users.user", "username")
      .populate("group", "groupName");
      
    return { bills }; // Return an object with bills property
  } catch (error) {
    console.error("Error fetching user bills:", error);
    throw error; // Rethrow the error to be handled by the controller
  }
}


module.exports = {
  splitExpense, deleteExpense, getExpenses
};
