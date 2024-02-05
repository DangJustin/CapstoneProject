const Task = require('../models/taskModel');

function getTask(taskID) {
    // TODO
}

function getUserTasks(userID){
    // TODO
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