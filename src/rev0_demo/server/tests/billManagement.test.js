const db = require("./db");
const User = require("../models/userModel");
const Group = require("../models/groupModel");
const Bill = require("../models/billModel");
const UserDebt = require("../models/userDebtModel");
const billManagementService = require("../services/billManagementService");
const accountService = require("../services/accountService");
const { splitExpense } = require('../services/billManagementService');
// const router = require("../routes/databaseRoutes")
// const request = require('supertest')


// Have This block before the tests
beforeAll(async () => {
  await db.connect();
});
afterAll(async () => {
  await db.disconnect();
});
afterEach(async () => {
  await db.clearDatabase();
});
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
  const groupName = "Test Create Task";
  let group = new Group({ groupName: groupName, users: [] });
  group.users.push(user1._id, user2._id);
  await group.save();

  //Add new task
  // const bill2 = await billManagementService.splitExpense("Random expense 2", group._id, new Date(), "This is random task", [user1._id]);
});

describe("POST /split-expense", () => {
  it("Should split an expense among users and create a bill", async () => {
    // Fetch the created users and group
    const user1 = await User.findOne({ userID: "111111111" });
    const user2 = await User.findOne({ userID: "222222222" });
    const group = await Group.findOne({ groupName: "Test Create Task" });

    // Make sure users and group exist
    expect(user1).toBeDefined();
    expect(user2).toBeDefined();
    expect(group).toBeDefined();

    // Split the expense
    const bill1 = await billManagementService.splitExpense({
      userID: user1.userID,
      amount: 100,
      description: "random",
      participants: [user2._id],
      groupID: group._id,
    });

    // Verify that the bill was created
    const bills = await Bill.find();
    expect(bills.length).toBe(1);

    // Check bill details
    const bill = bills[0];
    expect(bill.totalAmount).toBe(100);
    expect(bill.users.length).toBe(2); // Assuming only 2 users are involved
    // Add more assertions based on your bill schema
  });
});

describe("POST /split-expense", () => {
  it("Should split an expense among users and create a bill with equal individual amounts", async () => {
    // Test data
    const user1 = await User.findOne({ userID: "111111111" });
    const user2 = await User.findOne({ userID: "222222222" });
    const group = await Group.findOne({ groupName: "Test Create Task" });

    // Make sure users and group exist
    expect(user1).toBeDefined();
    expect(user2).toBeDefined();
    expect(group).toBeDefined();

    // Split the expense with equal individual amounts
    const bill1 = await splitExpense({
      userID: user1.userID,
      amount: 100,
      description: "random",
      participants: [user2._id],
      groupID: group._id,
    });

    // Verify that the bill was created
    const bills = await Bill.find();
    expect(bills.length).toBe(1);

    // Check bill details
    const bill = bills[0];
    expect(bill.totalAmount).toBe(100);
    expect(bill.users.length).toBe(2); // Assuming only 2 users are involved
    expect(bill.users[0].amountOwed).toBe(50); // User 1 owes 50
    expect(bill.users[1].amountOwed).toBe(50); // User 2 owes 50
    

  });

  it("Should split an expense among users and create a bill with custom individual amounts", async () => {
    // Test data
    const user1 = await User.findOne({ userID: "111111111" });
    const user2 = await User.findOne({ userID: "222222222" });
    const group = await Group.findOne({ groupName: "Test Create Task" });

    // Make sure users and group exist
    expect(user1).toBeDefined();
    expect(user2).toBeDefined();
    expect(group).toBeDefined();

    // Split the expense with custom individual amounts
    const bill2 = await splitExpense({
      userID: user1.userID,
      amount: 200,
      description: "random",
      participants: [user2._id],
      groupID: group._id,
      individualAmounts: [150], // Custom individual amount for user2
    });

    // Verify that the bill was created
    const bills = await Bill.find();
    expect(bills.length).toBe(1); 

    // Check bill details
    const bill = bills[0]; // Get the newly created bill
    expect(bill.totalAmount).toBe(200);
    expect(bill.users.length).toBe(2); // Assuming only 2 users are involved
    expect(bill.users[0].amountOwed).toBe(50); // User 1 owes 50
    expect(bill.users[1].amountOwed).toBe(150); // User 2 owes 150
    // Add more assertions based on your bill schema
  });

  it("Should throw an error if the initiating user is not found", async () => {
    // Attempt to split expense with non-existent user
    await expect(splitExpense({
      userID: "invalidUserID",
      amount: 100,
      description: "random",
      participants: ["validUserID"],
      groupID: "validGroupID",
    })).rejects.toThrow("Internal Server Error");
  });

  it("Should throw an error if the group is not found", async () => {
    // Attempt to split expense with non-existent group
    await expect(splitExpense({
      userID: "validUserID",
      amount: 100,
      description: "random",
      participants: ["validUserID"],
      groupID: "invalidGroupID",
    })).rejects.toThrow("Internal Server Error");
  });

  // Add more test cases for error scenarios, edge cases, etc.
});