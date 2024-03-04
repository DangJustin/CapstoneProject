const express = require('express');

// Create a router instance
const router = express.Router();
const billManagementController = require('../controllers/billManagementController');

router.get('/', billManagementController.index);
router.post('/split-expense', billManagementController.splitExpense);
router.delete('/bills/:billId',billManagementController.deleteExpense);
router.get('/user-bills/:userId',billManagementController.getExpenses);

module.exports = router;
