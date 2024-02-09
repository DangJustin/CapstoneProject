const accountService = require('../services/accountService');
exports.index = async (req, res, next) => {
    console.log("Account");
    res.status(200).send("This is the index for the account module");
  }

// Get group based on group._id
exports.getGroup = async (req, res, next) => {
  const groupID = req.params.id;
  console.log("Account getGroup: " + String(groupID));
  try {
    const group = await accountService.getGroup(groupID);
    res.status(200).json(group);
  } catch (error){
    res.status(500).json({ error: 'Internal Server Error' });
  }
}

// Get user based on user.userID
exports.getUser = async (req, res, next) => {
  const userID = req.params.id;
  console.log("Account getUser: " + String(userID));
  try {
    const user = await accountService.getUser(userID);
    res.status(200).json(user);
  } catch (error){
    res.status(500).json({ error: 'Internal Server Error' });
  }
}

// Get user based off user._id
exports.getUserOffID = async (req, res, next) => {
  const userID = req.params.id;
  console.log("Account getUser: " + String(userID));
  try {
    const user = await accountService.getUserOffID(userID);
    res.status(200).json(user);
  } catch (error){
    res.status(500).json({ error: 'Internal Server Error' });
  }
}