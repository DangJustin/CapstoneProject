const express = require("express");
const router = express.Router();
const User = require("../models/userModel");
const Group = require("../models/groupModel");
const Bill = require("../models/billModel");
const UserDebt = require("../models/userDebtModel");
const UserStreak = require("../models/userStreakModel");

// PUT a user in a group
router.put("/group/:groupName/user/:userId", async (req, res) => {
  const groupName = req.params.groupName;
  const userId = req.params.userId;

  try {
    let group = await Group.findOne({ groupName: groupName });

    if (!group) {
      group = new Group({ groupName: groupName, users: [] });
    }

    const user = await User.findOne({ userID: userId });
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    if (group.users.includes(user._id)) {
      return res.status(400).json({ error: "User already in group" });
    }

    group.users.push(user._id);

    await group.save();

    res.status(200).json({ message: "User added to group", group: group });
  } catch (error) {
    console.error("Error adding user to group:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// Endpoint to get current logged in user's info
router.get("/user/:userId", async (req, res) => {
  try {
    const userId = req.params.userId;

    // Fetch the user from the database based on the user ID
    const user = await User.findOne({ userID: userId });

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    // Return the user info in the response
    res.json(user);
  } catch (error) {
    console.error("Error fetching user info:", error);
    res.status(500).json({ error: "Internal Server Error" });
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
    const participants = await User.find({
      _id: { $in: group.users },
      userID: { $ne: userId },
    });

    res.json(participants);
  } catch (error) {
    console.error("Error fetching group participants:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// Endpoint to get all users involved in a group including user
router.get(
  "/group-participants/:groupId/all-users/:userId",
  async (req, res) => {
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
  }
);

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

router.put("/updateUserAmount/:userId", async (req, res) => {
  const { userId } = req.params.userId;
  const { owedUserEmail, settlementAmount, owingUserEmail } = req.body;

  try {

    const owingUser = await User.findOne({ email: owingUserEmail });
    if (!owingUser) {
        console.log("Owing user not found");
        return;
    }

    const owedUser = await User.findOne({ email: owedUserEmail });
    if (!owedUser) {
        console.log("Owed user not found");
        return;
    }

    owingUser.amount += settlementAmount;
    owedUser.amount -= settlementAmount;

    await owingUser.save();
    await owedUser.save();

    const owingUserDebt = await UserDebt.findOne({ from: owingUser._id, to: owedUser._id });
    const owedUserDebt = await UserDebt.findOne({ from: owedUser._id, to: owingUser._id });

    const greaterAmount = Math.max(owingUserDebt.amount, owedUserDebt.amount);
    const lesserAmount = Math.min(owingUserDebt.amount, owedUserDebt.amount);

        // Update UserDebt amounts
        if (owingUserDebt.amount === greaterAmount) {
            owingUserDebt.amount -= Math.min(greaterAmount, settlementAmount);
            owedUserDebt.amount -= Math.max(0, settlementAmount - greaterAmount);
        } else {
            owedUserDebt.amount -= Math.min(greaterAmount, settlementAmount);
            owingUserDebt.amount -= Math.max(0, settlementAmount - greaterAmount);
        }

        await owingUserDebt.save();
        await owedUserDebt.save();
    
    
    console.log("Settlement amount updated successfully");


  } catch (err) {
    console.error("Error settling debt:", err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

router.get("/userEmail/:email", async (req, res) => {
  try {
    const userEmail = req.params.email;

    const user = await User.findOne({ email: userEmail });
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    res.json(user);
  } catch (error) {
    console.error("Error fetching user info:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

router.get("/userStreak/:userId", async (req, res) => {
  try {
    const userId = req.params.userId;

    // Find the user based on the email address
    const user = await User.findOne({ userID: userId });

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    // Fetch the user's streak information from the UserStreak collection
    const userStreak = await UserStreak.findOne({ user: user._id });
    if (!userStreak) {
      // If no streak information is found, return default values
      return res.json({ currentStreak: 1, maxStreak: 1 });
    }

    // Return the user's streak information as JSON
    res.json({
      currentStreak: userStreak.currentStreak,
      maxStreak: userStreak.maxStreak,
    });
  } catch (error) {
    console.error("Error fetching user info:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

module.exports = router;
