const express = require('express');

// Create a router instance
const router = express.Router();
const Event = require('../models/eventModel');


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



module.exports = router;