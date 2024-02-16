const express = require('express');
const mongoose = require('mongoose');
const ObjectId = mongoose.Types.ObjectId;


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

// GET events in a group using group
router.get('/group/:groupId/events', async (req, res) => {
    try {

        const events = await Event.find({ groupID: new ObjectId(req.params.groupId) });

        // Send back the found events
        res.json(events);
    } catch (error) {
        console.error('Error fetching events:', error);
        res.status(500).json({ message: error.message });
    }
});



module.exports = router;