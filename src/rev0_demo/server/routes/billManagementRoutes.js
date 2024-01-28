const express = require('express');

// Create a router instance
const router = express.Router();


router.get('/', async (req, res) => {
  console.log("Bill Management");
  res.status(200).send("This is the bill Management");
});

module.exports = router;