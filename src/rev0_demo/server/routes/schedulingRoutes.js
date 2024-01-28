const express = require('express');

// Create a router instance
const router = express.Router();
const schedulingController = require('../controllers/schedulingController');


router.get('/', schedulingController.index);

module.exports = router;