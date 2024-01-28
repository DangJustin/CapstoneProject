const express = require('express');

// Create a router instance
const router = express.Router();


router.get('/', async (req, res) => {
  console.log("Account");
  res.status(200).send("This is the account");
});

module.exports = router;