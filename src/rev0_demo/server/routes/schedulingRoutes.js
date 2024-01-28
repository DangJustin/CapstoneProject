const express = require('express');

// Create a router instance
const router = express.Router();


router.get('/', async (req, res) => {
  console.log("Scheduling");
  res.status(200).send("This is the scheduling");
});

module.exports = router;