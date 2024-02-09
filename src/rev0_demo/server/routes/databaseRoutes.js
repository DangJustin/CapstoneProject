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
    let bill = await Bill.findById(billId);
    if (!bill) {
      return res.status(404).json({ error: "Bill not found" });
    }

    // Calculate the total amount difference
    const totalAmountDiff = updatedData.totalAmount - bill.totalAmount;
    const oldBillAmount = bill.totalAmount;
    const oldBillLen = bill.users.length;

    // Update specific fields of the bill
    if (updatedData.totalAmount) {
      bill.totalAmount = updatedData.totalAmount;
    }
    if (updatedData.description) {
      bill.description = updatedData.description;
    }
    if (updatedData.users) {
      // Calculate the amount owed per user
      const numUsers = updatedData.users.length;
      const amountOwedPerUser = bill.totalAmount / numUsers;

      const oldUsers = bill.users.slice(1);
      newUsers = updatedData.users.slice(1);
      // Extract user IDs from oldUsers
      const oldUserIds = oldUsers.map((user) => user.user.toString());

      // Find users present in oldUsers but not in newUsers using filter and includes
      const usersNotInNewList = oldUsers.filter(
        (user) =>
          !newUsers.some((newUser) => newUser.user === user.user.toString())
      );
      // Find users present in newUsers but not in oldUsers using filter and includes
      const usersNotInOldList = newUsers.filter(
        (newUser) => !oldUserIds.includes(newUser.user)
      );

      // Find users present in both oldUsers and newUsers using filter and includes
      const usersInBothLists = oldUsers.filter((user) =>
        newUsers.some((newUser) => newUser.user === user.user.toString())
      );

      const firstUserId = bill.users[0].user;

      if (usersNotInNewList) {
        await Promise.all(
          usersNotInNewList.map(async (userData) => {
            const user = await User.findById(userData.user);
            if (user) {
              user.amount += oldBillAmount / oldBillLen;
              await user.save();
            }

            await UserDebt.findOneAndUpdate(
              { from: firstUserId, to: userData.user },
              { $inc: { amount: -(oldBillAmount / oldBillLen) } },
              { upsert: true }
            );
          })
        );
      }

      if (usersNotInOldList) {
        await Promise.all(
          usersNotInOldList.map(async (userData) => {
            const user = await User.findById(userData.user);
            if (user) {
              user.amount -= bill.totalAmount / (newUsers.length + 1);
              await user.save();
            }

            await UserDebt.findOneAndUpdate(
              { from: firstUserId, to: userData.user },
              { $inc: { amount: bill.totalAmount / (newUsers.length + 1) } },
              { upsert: true }
            );
          })
        );
      }

      if (usersInBothLists) {
        await Promise.all(
          usersInBothLists.map(async (userData) => {
            const user = await User.findById(userData.user);
            const newAmount = bill.totalAmount / (newUsers.length + 1);
            const oldAmount = oldBillAmount / oldBillLen;
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
      if (userA) {
        newAmount = bill.totalAmount - bill.totalAmount / (newUsers.length + 1);
        oldAmount = oldBillAmount - oldBillAmount / oldBillLen;
        userA.amount += newAmount - oldAmount;
        await userA.save();
      }
      // Update each user's amount owed
      bill.users = updatedData.users.map((user, index) => ({
        user: index === 0 ? bill.users[0].user : user.user, // Change the first user's ID manually
        amountOwed: amountOwedPerUser,
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
      console.log("debt", debt)
      netDebts[debt.from.email] -= debt.amount;
    });
    debtsFromUser.forEach((debt) => {
      if (!netDebts[debt.to.email]) {
        netDebts[debt.to.email] = 0;
      }
      console.log("debt2", debt.amount)
      netDebts[debt.to.email] += debt.amount;
    });
    res.json({ userAmount: user.amount, netDebts: netDebts });
  } catch (error) {
    console.error("Error fetching user debts:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

module.exports = router;
