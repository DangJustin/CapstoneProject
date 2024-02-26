const mongoose = require("mongoose");
const db = require('./db');
const User = require('../models/userModel');

// Have This block before the tests
beforeAll(async () => {await db.connect()});
afterEach(async () => {await db.clearDatabase()});
afterAll(async () => {await db.disconnect()});

// Tests
describe('User tests', () => {
    it('Create user and find that it exists with the same properties', async () => {
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
    it('Should find no user', async () => {
        const user = await User.findOne({userID:"123456789"});
        expect(user).toEqual(null);
    });
})

