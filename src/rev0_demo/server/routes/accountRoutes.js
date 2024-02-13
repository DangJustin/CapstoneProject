const express = require('express');

// Create a router instance
const router = express.Router();
const accountController = require('../controllers/accountController');
const User = require('../models/userModel');
const Group = require('../models/groupModel');


router.get('/', accountController.index);

// POST a new user
router.post('/', async (req, res) => {
    const { userID, email, username, firstname, lastname, phone } = req.body

    try {
        const user = await User.create({ userID, email, username, firstname, lastname, phone })
        console.log("Hello")
        res.status(200).json(user)
    } catch (error) {
        console.log(error)
        res.status(400).json({ message: "Error creating user", error: error });

    }
})


// Endpoint for retrieving a group ID by group name
router.get('/groups/:groupname/id', async (req, res) => {
    const groupname = req.params.groupname;
  
    try {
      const group = await Group.findOne({ groupName: groupname });
  
      if (!group) {
        return res.status(404).json({ message: 'Group not found' });
      }
      
      res.json({ groupId: group._id });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  });
  


// GET a user by email
router.get('/user', async (req, res) => {
    const { email } = req.query; // Access the email sent as a query parameter

    // Validate that email is not empty
    if (!email) {
        return res.status(400).json({ message: "Email is required" });
    }

    try {
        // Find the user by email
        const user = await User.findOne({ email: email }).exec();

        // If a user is found, respond with the user's name
        if (user) {
            res.status(200).json({ userID: user.userID, email: user.email, username: user.username, firstname: user.firstname, lastname: user.lastname, phone: user.phone, amount: user.amount });
        } else {
            // If no user is found, respond with an appropriate message
            res.status(404).json({ message: "User not found" });
        }
    } catch (error) {
        // If there's an error, log it and respond with an error message
        console.error(error);
        res.status(500).json({ message: "Error fetching user", error: error });
    }
});


// POST a new group
router.post('/addGroup', async (req, res) => {
    const { name, users } = req.body

    try {
        const group = await Group.create({ name, users })
        res.status(200).json(group)
    } catch (error) {
        console.log(error)
        res.status(400).json({ message: "Error creating group", error: error });

    }
})

// GET group based off group._id
router.get('/groups/group/:id',accountController.getGroup);


// GET user based off user.userID
router.get('/users/user/:id',accountController.getUser);

// GET user based off user._id
router.get('/users/id/:id',accountController.getUserOffID);

module.exports = router;