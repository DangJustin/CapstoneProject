const mongoose = require("mongoose");
const db = require('./db');
const User = require('../models/userModel');
const Group = require("../models/groupModel");
const Event = require('../models/eventModel');
const schedulingService = require('../services/schedulingService');

// Have This block before the tests
beforeAll(async () => { await db.connect() });
afterEach(async () => {
  console.error.mockRestore();
await db.clearDatabase();
});

afterAll(async () => { await db.disconnect() });

let testUser1, testUser2, testGroup, testEvent;

beforeEach(async () => {
    jest.spyOn(console, 'error').mockImplementation(() => {});
    //Add 2 new users
    testUser1 = await User.create({
        userID: "111111111",
        email: "testTask1@gmail.com",
        username: "testTask1",
        firstname: "Test",
        lastname: "Task1",
        phone: "1234567890",
    });
    testUser2 = await User.create({
        userID: "222222222",
        email: "testTask2@gmail.com",
        username: "testTask2",
        firstname: "Test",
        lastname: "Task2",
        phone: "1234567890",
    });

    //Add new group and users to group
    testGroup = await Group.create({
        groupName: "Test Events",
        users: [testUser1._id, testUser2._id]
    });

    //Add new event
    testEvent = await Event.create({
        eventname: "Test Event",
        datetime: new Date(),
        minutes: 60,
        groupID: testGroup._id
    });
});

// Tests
describe('Scheduling tests', () => {
    it('should add a new event', async () => {
        const eventname = "Meeting";
        const datetime = new Date();
        const minutes = 30;

        const newEvent = await schedulingService.addEvent(eventname, datetime, minutes, testGroup._id);
        expect(newEvent).toHaveProperty('_id');
        expect(newEvent.eventname).toBe(eventname);
        expect(newEvent.datetime).toEqual(datetime);
        expect(newEvent.minutes).toBe(minutes);
    });

    it('should edit an event', async () => {
        const updateData = {
            eventname: "Updated Meeting",
            datetime: new Date(new Date().setDate(new Date().getDate() + 1)), // Tomorrow
            minutes: 45
        };

        const editedEvent = await schedulingService.editEvent(testEvent._id, updateData);
        expect(editedEvent.eventname).toBe(updateData.eventname);
        expect(editedEvent.datetime.toISOString()).toBe(updateData.datetime.toISOString());
        expect(editedEvent.minutes).toBe(updateData.minutes);
    });

    it('should delete an event', async () => {
        const response = await schedulingService.deleteEvent(testEvent._id);
        expect(response.message).toBe('Event deleted successfully');
        const deletedEvent = await Event.findById(testEvent._id);
        expect(deletedEvent).toBeNull();
    });

    it('should get all events for a group', async () => {
        const events = await schedulingService.getGroupEvents(testGroup._id);
        expect(Array.isArray(events)).toBe(true);
        expect(events).toHaveLength(1);
        expect(events[0]._id.toString()).toBe(testEvent._id.toString());
    });

    it('should get all events for a user', async () => {
        const events = await schedulingService.getUserEvents(testUser1._id);
        expect(Array.isArray(events)).toBe(true);
        expect(events).toHaveLength(1);
        expect(events[0]._id.toString()).toBe(testEvent._id.toString());
    });

});

describe('Scheduling tests - Error Handling', () => {
  it('should throw an error when adding an event to a non-existent group', async () => {
      const eventname = "Non-existent Group Meeting";
      const datetime = new Date();
      const minutes = 60;
      const nonExistentGroupId = new mongoose.Types.ObjectId();

      await expect(schedulingService.addEvent(eventname, datetime, minutes, nonExistentGroupId))
          .rejects
          .toThrow('Group not found');
  });

  it('should throw an error when editing a non-existent event', async () => {
      const nonExistentEventId = new mongoose.Types.ObjectId();
      const updateData = {
          eventname: "Updated Meeting",
          datetime: new Date(),
          minutes: 45
      };

      await expect(schedulingService.editEvent(nonExistentEventId, updateData))
          .rejects
          .toThrow('Event not found');
  });

  it('should throw an error when deleting a non-existent event', async () => {
      const nonExistentEventId = new mongoose.Types.ObjectId();

      await expect(schedulingService.deleteEvent(nonExistentEventId))
          .rejects
          .toThrow('Event not found');
  });

  it('should return an empty array when getting events for a non-existent group', async () => {
      const nonExistentGroupId = new mongoose.Types.ObjectId();

      const events = await schedulingService.getGroupEvents(nonExistentGroupId);
      expect(Array.isArray(events)).toBe(true);
      expect(events).toHaveLength(0);
  });

  it('should return an empty array when getting events for a user with no groups', async () => {
      // Create a user that isn't part of any group
      const newUser = await User.create({
          userID: "333333333",
          email: "noGroupsUser@example.com",
          username: "noGroupsUser",
          firstname: "Test",
          lastname: "User",
          phone: "1234567890"
      });

      const events = await schedulingService.getUserEvents(newUser._id);
      expect(Array.isArray(events)).toBe(true);
      expect(events).toHaveLength(0);
  });

});