const express = require('express');
const taskManagementRoutes = require('./taskManagementRoutes');
const accountRoutes = require('./accountRoutes');
const billManagementRoutes = require('./billManagementRoutes');
const schedulingRoutes = require('./schedulingRoutes');

// Create a router instance
const router = express.Router();

// Middleware to print out time, request url, and request type
router.use((req, res, next) => {
  console.log('Time:', Date.now());
  console.log('Request URL:', req.originalUrl);
  console.log('Request Type:', req.method);
  console.log('Request Parameters:',req.params); 
  next()
})

router.use('/taskManagement',taskManagementRoutes);
router.use('/account',accountRoutes);
router.use('/billManagement',billManagementRoutes);
router.use('/scheduling',schedulingRoutes);

router.get('/', async (req, res) => {
  console.log("test");
  res.send("This is the index for Housemates API");
});

module.exports = router;