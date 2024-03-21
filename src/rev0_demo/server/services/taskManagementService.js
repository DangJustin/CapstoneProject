const Task = require('../models/taskModel');
const accountService = require('../services/accountService');

async function getTask(taskID) {
  try {
    const task = await Task.findById(taskID);
    return task;
  } catch (error){
    console.log("Error getting task: ", taskID, error);
    throw error;
  }
}

async function getUserTasks(userID){
  try {
    const userGroups = await accountService.getUserGroups(userID);
    tasks = [];
    for (let i = 0; i < userGroups.length; i++){
      group = userGroups[i];
      task = await Task.find({groupID:group._id});
      tasks = tasks.concat(task);
    }
    return tasks;
  } catch (error){
    console.log("Error getting task: ", error);
    throw error;
  }
}

async function addTask(taskName, groupID, deadlineDate, description, usersResponsible){
    try {
        // Create a new task instance
        const newTask = new Task({
          taskName,
          groupID,
          deadlineDate,
          description,
          usersResponsible,
        });
        
        // Save the new task to the database
        const savedTask = await newTask.save();
    
        // Return the saved task
        return savedTask;
      } catch (error) {
        // Handle any errors during the task creation
        console.error('Error adding task:', error);
        throw error;
      }
}

async function completeTask(taskID){
    try {
      const task = await getTask(taskID);
      task.completed = true;
      await task.save();
    } catch (error) {
      // Handle any errors during the task completion
      console.error('Error completing task:', error);
      throw error;
    }
}

async function reopenTask(taskID){
  try {
    const task = await getTask(taskID);
    task.completed = false;
    await task.save();
  } catch (error) {
    // Handle any errors during the task reopening
    console.error('Error reopening task:', error);
    throw error;
  }
}

async function editTask(taskData){
  try {
    const task = await Task.findById(taskData._id);
    task.taskName = taskData.taskName;
    task.description = taskData.description;
    task.deadlineDate = taskData.deadlineDate;
    await task.save();
  } catch (error) {
    // Handle any errors during the task completion
    console.error('Error updating task:', error);
    throw error;
  }
}

module.exports = { getTask, getUserTasks, addTask, completeTask, editTask, reopenTask };