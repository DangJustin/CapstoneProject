const mongoose = require('mongoose');
const db = require("./db");
const User = require("../models/userModel");
const Group = require("../models/groupModel");
const accountService = require("../services/accountService");

beforeAll(async () => {
  await db.connect();
});

afterAll(async () => {
  await db.disconnect();
});

beforeEach(async () => {
    jest.spyOn(console, 'error').mockImplementation(() => {});
  await db.clearDatabase();

  // Create and save a new user to the database
  this.user = await User.create({
    userID: "user123",
    email: "test@example.com",
    username: "testuser",
    firstname: "Test",
    lastname: "User",
    phone: "1234567890"
  });

  // Create and save a new group to the database
  this.group = await Group.create({
    groupName: "Test Group",
    users: [this.user._id]
  });
});

afterEach(async () => {
    console.error.mockRestore();
  await db.clearDatabase();
});

describe("Account Service", () => {
  
  it("should retrieve groups for a specific user", async () => {
    const groups = await accountService.getUserGroups(this.user.userID);
    expect(groups.length).toBe(1);
    expect(groups[0].toJSON()).toMatchObject({ groupName: "Test Group" });
    expect(groups[0].users).toContainEqual(this.user._id);
  });

  it("should retrieve a user based on userID", async () => {
    const foundUser = await accountService.getUser(this.user.userID);
    expect(foundUser).toBeDefined();
    expect(foundUser.userID).toBe(this.user.userID);
    expect(foundUser.email).toBe("test@example.com");
  });

  it("should retrieve a user based on _id", async () => {
    const foundUser = await accountService.getUserOffID(this.user._id);
    expect(foundUser).toBeDefined();
    expect(foundUser._id).toEqual(this.user._id);
    expect(foundUser.username).toBe("testuser");
  });

  it("should retrieve a group based on groupID", async () => {
    const foundGroup = await accountService.getGroup(this.group._id);
    expect(foundGroup).toBeDefined();
    expect(foundGroup._id).toEqual(this.group._id);
    expect(foundGroup.groupName).toBe("Test Group");
  });

  // Error handling tests

  it("should throw an error if a user is not found for getUserGroups", async () => {
    const nonExistentUserID = new mongoose.Types.ObjectId().toString();
    await expect(accountService.getUserGroups(nonExistentUserID))
      .rejects
      .toThrow("User with ID: " + nonExistentUserID + " Not found");
  });

  it("should throw an error if a user is not found for getUser", async () => {
    const nonExistentUserID = new mongoose.Types.ObjectId().toString();
    await expect(accountService.getUser(nonExistentUserID))
      .rejects
      .toThrow("User with ID: " + nonExistentUserID + " Not found");
  });

  it("should throw an error if a user is not found for getUserOffID", async () => {
    const nonExistentUserID = new mongoose.Types.ObjectId();
    await expect(accountService.getUserOffID(nonExistentUserID))
      .rejects
      .toThrow("User with ID: " + nonExistentUserID.toString() + " Not found");
  });

  it("should throw an error if a group is not found for getGroup", async () => {
    const nonExistentGroupID = new mongoose.Types.ObjectId();
    await expect(accountService.getGroup(nonExistentGroupID))
      .rejects
      .toThrow("Group with ID: " + nonExistentGroupID.toString() + " Not found");
  });

});
