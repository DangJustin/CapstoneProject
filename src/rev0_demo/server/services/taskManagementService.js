const Task = require('../models/taskModel');
const UserStreak = require('../models/userStreakModel');
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

async function completeTask(taskID) {
  try {
    const task = await getTask(taskID);
    
    // Check if the task is completed within the deadline
    const completionDate = new Date();
    const deadlineDate = new Date(task.deadlineDate);
    const isOnTime = completionDate <= deadlineDate;

    // Update streaks based on completion status
    if (isOnTime) {
      // Task completed on time, increment current streak for each user
      for (const userId of task.usersResponsible) {
        const userStreak = await UserStreak.findOne({ user: userId });
        const currentStreak = userStreak ? userStreak.currentStreak + 1 : 1;
        await UserStreak.findOneAndUpdate(
          { user: userId },
          { $inc: { currentStreak: 1 }, $max: { maxStreak: currentStreak } },
          { upsert: true } // Create streak document if it doesn't exist
        );
      }
    } else {
      // Task completed after deadline, reset current streak
      await UserStreak.findOneAndUpdate(
        { user: task.user },
        { $set: { currentStreak: 0 } },
        { upsert: true } // Create streak document if it doesn't exist
      );
    }

    // Mark the task as completed
    task.completed = true;
    await task.save();
    console.log("Task completed successfully");
  } catch (error) {
    // Handle any errors during the task completion
    console.error('Error completing task:', error);
    throw error; // You may want to handle errors in a more specific way
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