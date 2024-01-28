const express = require('express');

// Create a router instance
const router = express.Router();
const accountController = require('../controllers/accountController')


router.get('/', accountController.index);

module.exports = router;