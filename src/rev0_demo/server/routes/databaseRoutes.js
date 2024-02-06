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
      { _id: { $in: group.users }, userID: { $ne: userId } },
      "_id email"
    );

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

module.exports = router;
