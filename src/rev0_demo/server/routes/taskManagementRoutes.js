const express = require('express');

// Create a router instance
const router = express.Router();


router.get('/', async (req, res) => {
  console.log("Task Management");
  res.status(200).send("This is the task management");
});

module.exports = router;