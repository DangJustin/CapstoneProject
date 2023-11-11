const express = require('express');
const User = require('./user');
const Group = require('./group');

// Create a router instance
const router = express.Router();

// Handle POST requests to the root endpoint ('/')
router.post('/', async (req, res) => {
  
  // Extract the 'username' from the request body
  const { username } = req.body;

  try {
    // Check if a user with the provided username already exists in the database
    const check = await User.findOne({ username: username });

    // If a user with the given username exists, return the user details
    if (check) {
      res.json(check);
    } else {
      // If no user with the given username is found, return 'notexist'
      res.json("notexist");
    }

  } catch (e) {
    // If an error occurs during the database query or any other operation, return 'fail'
    res.json("fail");
  }

});

// Handle POST requests to the '/newusers' endpoint
router.post('/newusers', async (req, res) => {
  
  // Extract the 'username' from the request body
  const { username } = req.body;
  
  try {
    // Check if a user with the provided username already exists in the database
    const check = await User.findOne({ username: username });

    // If a user with the given username already exists, return 'exist'
    if (check) {
      res.json("exist");
    } else {
      // If no user with the given username is found, create a new user

      // Create a new user using the User model and the request body
      const user = new User(req.body);
      
      // Save the new user to the database
      await user.save();

      // Return the details of the newly created user
      res.json(user);
    }
  }
  catch (e) {
    // If an error occurs during the database query or any other operation, return 'fail'
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

// Endpoint for retrieving all groups
router.get('/groups', async (req, res) => {
  try {
    // Use the User model to find all groups in the database
    const groups = await Group.find();
    // Send a response with the list of groups as the response body
    res.json(groups);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Endpoint for retrieving all groups for a specific user by username
router.get('/users/:username/groups', async (req, res) => {
  const username = req.params.username;

  try {
    // Use the User model to find the user by username
    const user = await User.findOne({ username }).populate('group');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    res.json(user.group);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Endpoint for retrieving all users for a specific group by groupname
router.get('/groups/:groupname/users', async (req, res) => {
  const groupname = req.params.groupname;
  console.log(groupname)

  try {
    // Use the User model to find the user by username
    const group = await Group.findOne({name: groupname }).populate('users');

    if (!group) {
      return res.status(404).json({ message: 'Group not found' });
    }
    
    res.json(group);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Endpoint for adding user to group
router.put('/groups', async (req, res) => {
  try {

    // Request looks like {"group_name":"group name", "user_name":"user name" }
    const {group_name} = req.body;
    const {user_name} = req.body;
    var group = await Group.findOne({name: group_name});
    var user = await User.findOne({username: user_name});

    // Look if user is already in group, then add user if not in group
    const in_group = group.users.some(user.equals,user);
    if (!in_group){
      group.users.push(user);
      await group.save();
    }


    // Send json of group
    res.json(group)
    
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Endpoint for emptying group
router.post('/groups/delete', async (req, res) => {
  try {

    // Request looks like {"group_name":"group name" }
    const {group_name} = req.body;
    console.log(group_name);
    var group = await Group.findOne({name: group_name});
    
    group.users = [];
    await group.save();
    res.json(group);
    
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});


module.exports = router;
