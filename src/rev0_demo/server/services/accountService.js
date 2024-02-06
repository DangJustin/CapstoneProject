const User = require("../models/userModel");
const Group = require("../models/groupModel");

// Method to find groups for a specific user
async function getUserGroups(userID){
    try {
        // Find User
        const user = await User.findOne({ userID: userID });
        if (!user){
            throw new Error('User with ID: ' + String(userID) + ' Not found')
        }
        // Retrieve the user's groups
        const userGroups = await Group.find({ users: user._id });
        return userGroups;
    } catch (error){
        console.error('Error trying to find group:', error);
        throw error; // You may want to handle errors in a more specific way
    }
}

module.exports = {getUserGroups};