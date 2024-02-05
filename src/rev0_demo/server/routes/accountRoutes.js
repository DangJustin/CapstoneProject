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

module.exports = router;