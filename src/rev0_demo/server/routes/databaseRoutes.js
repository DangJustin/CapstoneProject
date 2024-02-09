const express = require("express");
const router = express.Router();
const User = require("../models/userModel");
const Group = require("../models/groupModel");
const Bill = require("../models/billModel");
const UserDebt = require("../models/userDebtModel");

// Endpoint to get current logged in user's info
router.get('/user/:userId', async (req, res) => {
    try {
      const userId = req.params.userId;

      // Fetch the user from the database based on the user ID
      const user = await User.findOne({ userID: userId });
  
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }
      // Return the user info in the response
      res.json(user);
    } catch (error) {
      console.error('Error fetching user info:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  });

// Endpoint to get all groups that a user is involved in
router.get("/user-groups/:userId", async (req, res) => {
  try {
    const userId = req.params.userId;

    // Find the user by ID
    const user = await User.findOne({ userID: userId });
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Retrieve the user's groups
    const userGroups = await Group.find({ users: user._id });
    res.json(userGroups);
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// Endpoint to get all users involved in a group except request user
router.get("/group-participants/:groupId/user/:userId", async (req, res) => {
  try {
    const groupId = req.params.groupId;
    const userId = req.params.userId;

    // Fetch the group by ID
    const group = await Group.findById(groupId);
    if (!group) {
      return res.status(404).json({ error: "Group not found" });
    }

    // Fetch participants of the group (excluding the current user)
    const participants = await User.find(
      { _id: { $in: group.users }, userID: { $ne: userId } }
    );

    res.json(participants);
  } catch (error) {
    console.error("Error fetching group participants:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// Endpoint to get all users involved in a group including user
router.get("/group-participants/:groupId/all-users/:userId", async (req, res) => {
    try {
      const groupId = req.params.groupId;
      const userId = req.params.userId;
  
      // Fetch the group by ID
      const group = await Group.findById(groupId);
      if (!group) {
        return res.status(404).json({ error: "Group not found" });
      }
  
      // Fetch all participants of the group
      const participants = await User.find({ _id: { $in: group.users } });
  
      res.json(participants);
    } catch (error) {
      console.error("Error fetching group participants:", error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  });

// Get all bills associated with a user
router.get("/user-bills/:userId", async (req, res) => {
  try {
    const userId = req.params.userId;

    // Find the user by ID
    const user = await User.findOne({ userID: userId });
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const bills = await Bill.find({ "users.user": user })
      .populate("users.user", "username")
      .populate("group", "groupName");
    res.json(bills);
  } catch (error) {
    console.error("Error fetching user bills:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

router.put("/edit-bill/:billId", async (req, res) => {
  try {
    const billId = req.params.billId;
    const updatedData = req.body;

    // Find the bill by ID
    let bill = await Bill.findById(billId).populate("users.user", "amountOwed");

    if (!bill) {
      return res.status(404).json({ error: "Bill not found" });
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
        (newUser) => !oldUsers.some((oldUser) => oldUser.user._id.toString() === newUser.user.toString())
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
        const amountOwed = typeof user.amountOwed === 'string' ? parseFloat(user.amountOwed) : user.amountOwed;
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
        amountOwed: index === 0 ? updatedData.totalAmount - remainingAmount : user.amountOwed,
      }));

      // Update user amounts
    }
    if (updatedData.group) {
      bill.group = updatedData.group;
    }

    // Save the updated bill
    const updatedBill = await bill.save();

    // Send the updated bill as the response
    res.json(updatedBill);
  } catch (error) {
    console.error("Error updating bill:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

router.delete("/bills/:billId", async (req, res) => {
  const billId = req.params.billId;
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
      return res.status(404).json({ error: "Bill not found" });
    }

    res.status(200).json({ message: "Bill deleted successfully" });
  } catch (error) {
    console.error("Error deleting bill:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// Route to fetch all user debts
router.get("/userDebts/:userID", async (req, res) => {
  const userID = req.params.userID;
  try {
    // Find the user by userID
    const user = await User.findOne({ userID: userID });
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Retrieve debts where the user is owed money (user is the 'to' user)
    const debtsToUser = await UserDebt.find({ to: user._id }).populate(
      "from",
      "email"
    );

    // Retrieve debts where the user owes money (user is the 'from' user)
    const debtsFromUser = await UserDebt.find({ from: user._id }).populate(
      "to",
      "email"
    );

    // Calculate net debt relation for the user
    let netDebts = {};

    debtsToUser.forEach((debt) => {
      if (!netDebts[debt.from.email]) {
        netDebts[debt.from.email] = 0;
      }
      netDebts[debt.from.email] -= debt.amount;
    });
    debtsFromUser.forEach((debt) => {
      if (!netDebts[debt.to.email]) {
        netDebts[debt.to.email] = 0;
      }
      netDebts[debt.to.email] += debt.amount;
    });
    res.json({ userAmount: user.amount, netDebts: netDebts });
  } catch (error) {
    console.error("Error fetching user debts:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

module.exports = router;
