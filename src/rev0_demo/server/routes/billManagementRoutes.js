const express = require('express');

// Create a router instance
const router = express.Router();
const billManagementController = require('../controllers/billManagementController');

router.get('/', billManagementController.index);

module.exports = router;