const express = require('express');

// Create a router instance
const router = express.Router();
const schedulingController = require('../controllers/schedulingController');
const Event = require('../models/eventModel');


router.get('/', schedulingController.index);

// POST a new event
router.post('/', async (req, res) => {
    try {
        const event = await Event.create(req.body)
        console.log("CREATING EVENT")
        res.status(201).json(event)
    } catch (error) {
        console.log(error)
        res.status(500).json({ message: "Error creating event", error: error });
    }
})



module.exports = router;