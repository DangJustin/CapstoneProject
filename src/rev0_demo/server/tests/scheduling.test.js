const mongoose = require("mongoose");
const db = require('./db');
const User = require('../models/userModel');
const Group = require("../models/groupModel");
const Event = require('../models/eventModel');

// Have This block before the tests
beforeAll(async () => {await db.connect()});
afterEach(async () => {await db.clearDatabase()});
afterAll(async () => {await db.disconnect()});
beforeEach(async () => {
    //Add 2 new users
    const userID1 = "111111111";
    const userID2 = "222222222";
    const email1 = "testTask1@gmail.com";
    const email2 = "testTask2@gmail.com";
    const username1 = "testTask1";
    const username2 = "testTask2";
    const firstname = "Test";
    const lastname = "Task";
    const phone = "1234567890";
    const user1 = await User.create({
      userID: userID1,
      email: email1,
      username: username1,
      firstname,
      lastname,
      phone,
    });
    const user2 = await User.create({
      userID: userID2,
      email: email2,
      username: username2,
      firstname,
      lastname,
      phone,
    });
  
    //Add new group and users to group
    const groupName = "Test Events";
    let group = new Group({ groupName: groupName, users: [] });
    group.users.push(user1._id, user2._id);
    await group.save();
  
  });

// Tests
describe('Scheduling tests', () => {
    it('Placeholder', async () => {
        const userID = "123456789";
        const email = "123456@gmail.com";
        const username = "123username";
        const firstname = "Bill";
        const lastname = "Nye";
        const phone = "1234567890";
        const user = await User.create({ userID, email, username, firstname, lastname, phone });
        const id = user._id;
        const checkUser = await User.findById(id);
        expect(checkUser.userID).toEqual(userID);
    });
    it('Placeholder', async () => {
        const user = await User.findOne({userID:"123456789"});
        expect(user).toEqual(null);
    });
})

