const User = require("../models/userModel");
const Group = require("../models/groupModel");

// Method to find groups for a specific user
async function getUserGroups(userID) {
    try {
        // Find User
        const user = await User.findOne({ userID: userID });
        if (!user) {
            throw new Error('User with ID: ' + String(userID) + ' Not found')
        }
        // Retrieve the user's groups
        const userGroups = await Group.find({ users: user._id });
        return userGroups;
    } catch (error) {
        console.error('Error trying to find group:', error);
        throw error;
    }
}

// Method to find specific user based off user.userID
async function getUser(userID) {
    try {
        // Find User
        const user = await User.findOne({ userID: userID });
        if (!user) {
            throw new Error('User with ID: ' + String(userID) + ' Not found')
        }
        return user;
    } catch (error) {
        console.error('Error trying to find group:', error);
        throw error;
    }
}

// Method to find specific user based off user._id
async function getUserOffID(userID) {
    try {
        // Find User
        const user = await User.findById(userID);
        if (!user) {
            throw new Error('User with ID: ' + String(userID) + ' Not found')
        }
        return user;
    } catch (error) {
        console.error('Error trying to find group:', error);
        throw error;
    }
}

// Method to find specific group based off group._id
async function getGroup(groupID) {
    try {
        // Find User
        const group = await Group.findById(groupID);
        if (!group) {
            throw new Error('Group with ID: ' + String(groupID) + ' Not found')
        }
        return group;
    } catch (error) {
        console.error('Error trying to find group:', error);
        throw error;
    }
}

module.exports = { getUserGroups, getUser, getUserOffID, getGroup };