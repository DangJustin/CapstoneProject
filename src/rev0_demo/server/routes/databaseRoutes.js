const express = require('express');
const router = express.Router();
const User = require('../models/userModel');
const Group = require('../models/groupModel')

router.get('/users', async (req, res) => {
    try {
      const users = await User.find({}, '_id email'); // Adjust the projection to include the necessary fields
      res.json(users);
    } catch (error) {
      res.status(500).json({ error: 'Internal Server Error' });
    }
});

// Endpoint to get all groups that a user is involved in
router.get('/user-groups/:userId', async (req, res) => {
    try {
        const userId = req.params.userId;

        // Find the user by ID
        const user = await User.findOne({ userID: userId });
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        // Retrieve the user's groups
        const userGroups = await Group.find({ users: user._id });
        res.json(userGroups);
    } catch (error) {
        res.status(500).json({ error: 'Internal Server Error' });
    }
});


module.exports = router;
