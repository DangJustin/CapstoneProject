const express = require("express");
const router = express.Router();
const User = require("../models/userModel");
const Group = require("../models/groupModel");
const Bill = require("../models/billModel");

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

      console.log("old", oldUsers);
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

      if (usersNotInNewList) {
        await Promise.all(
          usersNotInNewList.map(async (userData) => {
            const user = await User.findById(userData.user);
            if (user) {
              user.amount += oldBillAmount / oldBillLen;
              await user.save();
            }
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
          })
        );
      }

      if (usersInBothLists) {
        await Promise.all(
          usersInBothLists.map(async (userData) => {
            const user = await User.findById(userData.user);
            if (user) {
              newAmount = bill.totalAmount / (newUsers.length + 1)
              oldAmount = oldBillAmount / oldBillLen;
              user.amount -= newAmount - oldAmount;
              console.log("new", newAmount);
              console.log("old", oldAmount);
              console.log("user", user.amount);

              await user.save();
            }
          })
        );
      }
      const firstUserId = bill.users[0].user;
      const userA = await User.findById(firstUserId);
      if (userA) {
        newAmount = bill.totalAmount - (bill.totalAmount / (newUsers.length + 1))
        oldAmount = oldBillAmount - (oldBillAmount / oldBillLen);
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

module.exports = router;
