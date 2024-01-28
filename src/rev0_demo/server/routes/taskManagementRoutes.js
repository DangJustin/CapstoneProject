const express = require('express');

// Create a router instance
const router = express.Router();
const taskManagementController = require('../controllers/taskManagementController');


router.get('/', taskManagementController.index);

module.exports = router;