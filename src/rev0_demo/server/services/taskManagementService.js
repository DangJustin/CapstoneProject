const Task = require('../models/taskModel');
const accountService = require('../services/accountService');

async function getTask(taskID) {
  try {
    const task = await Task.findById(taskID);
    return task;
  } catch (error){
    console.log("Error getting task: ", taskID, error);
    throw error; // You may want to handle errors in a more specific way
  }
    // TODO
}

async function getUserTasks(userID){
  try {
    const userGroups = await accountService.getUserGroups(userID);
    tasks = [];
    for (let i = 0; i < userGroups.length; i++){
      group = userGroups[i];
      task = await Task.find({groupID:group._id})
      tasks = tasks.concat(task);
    }
    return tasks;
  } catch (error){
    console.log("Error getting task: ", error);
    throw error; // You may want to handle errors in a more specific way
  }
}

async function addTask(taskName, groupID, deadlineDate, description){
    try {
        // Create a new task instance
        const newTask = new Task({
          taskName,
          groupID,
          deadlineDate,
          description,
        });
    
        // Save the new task to the database
        const savedTask = await newTask.save();
    
        // Return the saved task or perform additional actions
        return savedTask;
      } catch (error) {
        // Handle any errors during the task creation
        console.error('Error adding task:', error);
        throw error; // You may want to handle errors in a more specific way
      }
}

function completeTask(taskID){
    //TODO
}

module.exports = { getTask, getUserTasks, addTask, completeTask };