const express = require('express');
const User = require('./user');

// Create a router instance
const router = express.Router();

router.post('/', async(req,res) => {
  const { username } = req.body;

  try{
    const check = await User.findOne({ username: username });

    if(check){
        res.json(check);
    }
    else{
        res.json("notexist");
    }

  }
  catch(e){
      res.json("fail");
  }

});

router.post('/newusers', async(req, res) => {
  const { username } = req.body;
  
  try {
    const check = await User.findOne({ username: username });

    if(check){
      res.json("exist");
    }
    else{
      // Create a new user using the User model and the request body
      const user = new User(req.body);
      
      // Save the user to the database
      await user.save();

      res.json(check);
    }
  }
  catch(e){
    res.json("fail");
  }
});

// Endpoint for creating a new user
router.post('/users', async (req, res) => {
  try {
    // Create a new user using the User model and the request body
    const user = new User(req.body);
    
    // Save the user to the database
    await user.save();
    
    // Send a response with status code 201 (Created) and the created user as the response body
    res.status(201).send(user);
  } catch (error) {
    res.status(400).send(error);
  }
});

// Endpoint for retrieving all users
router.get('/users', async (req, res) => {
  try {
    // Use the User model to find all users in the database
    const users = await User.find();
    // Send a response with the list of users as the response body
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});


module.exports = router;
