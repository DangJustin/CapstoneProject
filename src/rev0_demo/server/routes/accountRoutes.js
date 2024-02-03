const express = require('express');

// Create a router instance
const router = express.Router();
const accountController = require('../controllers/accountController');
const User = require('../models/userModel');


router.get('/', accountController.index);

// POST a new user
router.post('/', async (req, res) => {
    const { email, username, firstname, lastname, phone } = req.body

    try {
        const user = await User.create({ email, username, firstname, lastname, phone })
        res.status(200).json(user)
    } catch (error) {
        res.status(400).json({ error: error.message })
    }
})

module.exports = router;