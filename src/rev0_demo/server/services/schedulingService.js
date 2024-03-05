const Event = require('../models/eventModel');
const Group = require('../models/groupModel');

// Add an event to the group
async function addEvent(eventname, datetime, minutes, groupID) {
  try {
    // Check if the group exists
    const group = await Group.findById(groupID);
    if (!group) {
      throw new Error('Group not found');
    }

    // Create a new event
    const newEvent = new Event({
      eventname,
      datetime,
      minutes,
      groupID
    });

    // Save the event
    await newEvent.save();

    return newEvent;
  } catch (error) {
    console.error('Error adding event:', error);
    throw error;
  }
}

// Edit an existing event
async function editEvent(eventID, updateData) {
  try {
    const event = await Event.findById(eventID);
    if (!event) {
      throw new Error('Event not found');
    }

    // Update event details
    Object.assign(event, updateData);

    // Save the updated event
    await event.save();

    return event;
  } catch (error) {
    console.error('Error editing event:', error);
    throw error;
  }
}

// Delete an event
async function deleteEvent(eventID) {
    try {
      const result = await Event.findByIdAndDelete(eventID);
      if (!result) {
        throw new Error('Event not found');
      }
      return { message: 'Event deleted successfully' };
    } catch (error) {
      console.error('Error deleting event:', error);
      throw error;
    }
  }
  
  

// Get events for a specific group
async function getGroupEvents(groupID) {
  try {
    const groupEvents = await Event.find({ groupID: groupID });
    return groupEvents;
  } catch (error) {
    console.error('Error getting group events:', error);
    throw error;
  }
}

// Get events for a specific user by finding all events in their groups
async function getUserEvents(userID) {
  try {
    const userGroups = await Group.find({ users: userID });
    let events = [];
    for (const group of userGroups) {
      const groupEvents = await Event.find({ groupID: group._id });
      events = events.concat(groupEvents);
    }
    return events;
  } catch (error) {
    console.error('Error getting user events:', error);
    throw error;
  }
}

module.exports = {
  addEvent,
  editEvent,
  deleteEvent,
  getGroupEvents,
  getUserEvents
};
