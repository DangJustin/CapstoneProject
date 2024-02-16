const db = require("./db");
const User = require("../models/userModel");
const Group = require("../models/groupModel");
const Bill = require("../models/billModel");
const UserDebt = require("../models/userDebtModel");
const billManagementService = require("../services/billManagementService");
const accountService = require("../services/accountService");

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
