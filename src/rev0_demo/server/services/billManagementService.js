const User = require("../models/userModel");
const Bill = require("../models/billModel");
const Group = require("../models/groupModel");
const UserDebt = require("../models/userDebtModel");

const splitExpense = async ({
  userID,
  amount,
  billName,
  participants,
  groupID,
  individualAmounts, // Added parameter for individual expense amounts
  category,
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
      individualAmounts = Array.from(
        { length: participants.length },
        () => amount / (participants.length + 1)
      );
    }

    // Create a new bill
    const newBill = new Bill({
      billName: billName,
      totalAmount: amount,
      users: [
        {
          user: userA._id,
          amountOwed:
            amount -
            individualAmounts.reduce((acc, val) => acc + parseFloat(val), 0), // Adjusted amount owed for User A
        },
      ],
      group: groupID || null,
      category: category,
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
          const existingDebt = await UserDebt.findOne({
            from: participant._id,
            to: userA._id,
          });

          if (!existingDebt) {
            // If the document doesn't exist, create a new one with amount set to 0
            await UserDebt.create({
              from: participant._id,
              to: userA._id,
              amount: 0,
            });
          }
        }
      })
    );

    userA.bills.push(newBill._id);
    await userA.save();

    // Save the bill
    await newBill.save();

    // Update user's amount
    userA.amount += individualAmounts.reduce(
      (acc, val) => acc + parseFloat(val),
      0
    ); // Adjust user's amount
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
};

const getExpenses = async (userId) => {
  try {
    // Find the user by ID
    const user = await User.findOne({ userID: userId });
    if (!user) {
      return { error: "User not found" }; // Return an object with an error property
    }

    const bills = await Bill.find({ "users.user": user })
      .populate("users.user")
      .populate("group", "groupName");

    return { bills }; // Return an object with bills property
  } catch (error) {
    console.error("Error fetching user bills:", error);
    throw error; // Rethrow the error to be handled by the controller
  }
};

const editBill = async (billId, updatedData) => {
  try {
    // Find the bill by ID
    let bill = await Bill.findById(billId).populate("users.user", "amountOwed");

    if (!bill) {
      return { error: "Bill not found" };
    }

    // Update specific fields of the bill
    if (updatedData.totalAmount) {
      bill.totalAmount = updatedData.totalAmount;
    }
    if (updatedData.description) {
      bill.description = updatedData.description;
    }
    if (updatedData.users) {
      // Calculate the amount owed per user
      const oldUsers = bill.users.slice(1);
      newUsers = updatedData.users.slice(1);
      // Extract user IDs from oldUsers

      // Find users present in oldUsers but not in newUsers using filter and includes
      const usersNotInNewList = oldUsers.filter(
        (user) =>
          !newUsers.some((newUser) => newUser.user === user.user._id.toString())
      );

      const usersNotInOldList = newUsers.filter(
        (newUser) =>
          !oldUsers.some(
            (oldUser) => oldUser.user._id.toString() === newUser.user.toString()
          )
      );

      // Find users present in both oldUsers and newUsers using filter and includes
      const usersInBothLists = oldUsers.filter((user) =>
        newUsers.some((newUser) => newUser.user === user.user._id.toString())
      );

      const firstUserId = bill.users[0].user;

      if (usersNotInNewList) {
        await Promise.all(
          usersNotInNewList.map(async (userData, index) => {
            const user = await User.findById(userData.user);
            let userAmountOwe = bill.users.find(
              (u) => u.user._id.toString() === user._id.toString()
            ).amountOwed;

            if (user) {
              user.amount += userAmountOwe;
              await user.save();
            }

            await UserDebt.findOneAndUpdate(
              { from: firstUserId, to: userData.user },
              { $inc: { amount: -userAmountOwe } },
              { upsert: true }
            );
          })
        );
      }

      if (usersNotInOldList) {
        await Promise.all(
          usersNotInOldList.map(async (userData) => {
            const user = await User.findById(userData.user);
            let userAmountOwe = updatedData.users.find(
              (u) => u.user.toString() === user._id.toString()
            ).amountOwed;
            if (user) {
              user.amount -= userAmountOwe;
              await user.save();
            }

            await UserDebt.findOneAndUpdate(
              { from: firstUserId, to: userData.user },
              { $inc: { amount: userAmountOwe } },
              { upsert: true }
            );
          })
        );
      }

      if (usersInBothLists) {
        await Promise.all(
          usersInBothLists.map(async (userData) => {
            const user = await User.findById(userData.user);
            const newAmount = updatedData.users.find(
              (u) => u.user.toString() === user._id.toString()
            ).amountOwed;
            const oldAmount = bill.users.find(
              (u) => u.user._id.toString() === user._id.toString()
            ).amountOwed;
            if (user) {
              user.amount -= newAmount - oldAmount;
              await user.save();
            }

            await UserDebt.findOneAndUpdate(
              { from: firstUserId, to: userData.user },
              { $inc: { amount: newAmount - oldAmount } },
              { upsert: true }
            );
          })
        );
      }
      const userA = await User.findById(firstUserId);
      const usersAmountOwedSum = updatedData.users.reduce((total, user) => {
        // Convert the amountOwed to a number (if it's a string)
        const amountOwed =
          typeof user.amountOwed === "string"
            ? parseFloat(user.amountOwed)
            : user.amountOwed;
        // Add the amountOwed to the total
        return total + amountOwed;
      }, 0);

      // Calculate the total amount minus the sum of all user amounts owed
      const remainingAmount = usersAmountOwedSum;

      if (userA) {
        newAmount = remainingAmount;
        oldAmount = bill.totalAmount - bill.users[0].amountOwed;
        userA.amount += newAmount - oldAmount;
        await userA.save();
      }

      // Update each user's amount owed
      bill.users = updatedData.users.map((user, index) => ({
        user: index === 0 ? bill.users[0].user : user.user, // Change the first user's ID manually
        amountOwed:
          index === 0
            ? updatedData.totalAmount - remainingAmount
            : user.amountOwed,
      }));

      // Update user amounts
    }
    if (updatedData.group) {
      bill.group = updatedData.group;
    }

    // Save the updated bill
    const updatedBill = await bill.save();
    const populateBill = await Bill.findById(updatedBill._id)
      .populate("users.user")
      .populate("group");

    // res.json(updatedBill);
  } catch (error) {
    console.error("Error updating bill:", error);
    throw error;
  }
};

module.exports = {
  splitExpense,
  deleteExpense,
  getExpenses,
  editBill,
};
