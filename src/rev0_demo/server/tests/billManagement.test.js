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
      billName: "random",
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


describe('Bill Management Tests', () => {
  let user1, user2, group, bill;

  beforeEach(async () => {
    // Clear the database before each test
    await Bill.deleteMany({});
    await User.deleteMany({});
    await Group.deleteMany({});

    // Create mock users
    user1 = await User.create({
      userID: '111111111',
      email: 'userBMtest1@example.com',
      username: 'user1',
      firstname: 'John',
      lastname: 'Doe',
      phone: '1234567890',
      amount: 0,
      bills: []
    });

    user2 = await User.create({
      userID: '222222222',
      email: 'userBMtest2@example.com',
      username: 'user2',
      firstname: 'Jane',
      lastname: 'Doe',
      phone: '9876543210',
      amount: 0,
      bills: []
    });

    // Create a mock group
    group = await Group.create({ groupName: 'BM TEST Group 1', users: [user1._id, user2._id] });
    bill = await Bill.create({ totalAmount: 100, users: [{ user: user1._id, amountOwed: 50 }, { user: user2._id, amountOwed: 50 }], group: group._id });
    
    // Update the users' bills array
    user1.bills.push(bill._id);
    user2.bills.push(bill._id);
    await user1.save();
    await user2.save();
  });

  describe('Delete Bill', () => {
    it('Should delete an existing bill', async () => {
      // Get the bill to be deleted
      const billToDelete = await Bill.findById(bill._id);

      // Delete the bill
      await billManagementService.deleteExpense(billToDelete._id);

      // Check if the bill is deleted from the database
      const deletedBill = await Bill.findById(billToDelete._id);
      expect(deletedBill).toBeNull();

      // Check if the bill is removed from associated users
      const updatedUser1 = await User.findById(user1._id);
      const updatedUser2 = await User.findById(user2._id);
      expect(updatedUser1.bills).not.toContain(billToDelete._id);
      expect(updatedUser2.bills).not.toContain(billToDelete._id);
    });

    it('Should handle deleting a non-existent bill', async () => {
      // Try to delete a non-existent bill
      const nonExistentBillId = "606c2d0d64f5e53d9c1d6b99"; // A random non-existent bill ID
      await expect(billManagementService.deleteExpense(nonExistentBillId)).rejects.toThrow();
    });
  });
  it('Should handle deleting a bill with invalid ID format', async () => {
    // Try to delete a bill with an invalid ID format
    const invalidBillId = "invalidIdFormat";
    await expect(billManagementService.deleteExpense(invalidBillId)).rejects.toThrow();
  });

  it('Should handle deleting a bill with null ID', async () => {
    // Try to delete a bill with null ID
    const nullBillId = null;
    await expect(billManagementService.deleteExpense(nullBillId)).rejects.toThrow();
  });

  it('Should handle deleting a bill with undefined ID', async () => {
    // Try to delete a bill with undefined ID
    const undefinedBillId = undefined;
    await expect(billManagementService.deleteExpense(undefinedBillId)).rejects.toThrow();
  });

  it('Should handle deleting a bill with empty string ID', async () => {
    // Try to delete a bill with an empty string ID
    const emptyStringBillId = "";
    await expect(billManagementService.deleteExpense(emptyStringBillId)).rejects.toThrow();
  });
});


describe('Get Expenses', () => {
  beforeEach(async () => {
    // Clear the database before each test
    await Bill.deleteMany({});
    await User.deleteMany({});
  });

  it('Should get expenses for an existing user', async () => {
    // Create a mock user
    const user = await User.create({
      userID: '123456789',
      email: 'test@example.com',
      username: 'testuser',
      firstname: 'John',
      lastname: 'Doe',
      phone: '1234567890',
      amount: 0,
      bills: []
    });

    // Create mock bills associated with the user
    await Bill.create({ totalAmount: 100, users: [{ user: user._id, amountOwed: 50 }], group: null });
    await Bill.create({ totalAmount: 200, users: [{ user: user._id, amountOwed: 100 }], group: null });

    // Call the service function to get the expenses for the user
    const expenses = await billManagementService.getExpenses(user.userID);

    // Check if the expenses array is not empty
    expect(expenses.bills).toHaveLength(2); // Assuming there are 2 bills associated with the user
  });
  it('Should handle getting expenses for a non-existent user', async () => {
    // Call the service function to get the expenses for a non-existent user
    const expenses = await billManagementService.getExpenses('999999999');

    // Check if the response contains the error message
    expect(expenses.error).toEqual('User not found');
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
      billName: "random",
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
      billName: "random",
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
      billName: "random",
      participants: ["validUserID"],
      groupID: "validGroupID",
    })).rejects.toThrow("Internal Server Error");
  });

  it("Should throw an error if the group is not found", async () => {
    // Attempt to split expense with non-existent group
    await expect(splitExpense({
      userID: "validUserID",
      amount: 100,
      billName: "random",
      participants: ["validUserID"],
      groupID: "invalidGroupID",
    })).rejects.toThrow("Internal Server Error");
  });

  // Add more test cases for error scenarios, edge cases, etc.
});