const express = require('express');

// Create a router instance
const router = express.Router();
const billManagementController = require('../controllers/billManagementController');

router.get('/', billManagementController.index);
router.post('/split-expense', billManagementController.splitExpense);
module.exports = router;

