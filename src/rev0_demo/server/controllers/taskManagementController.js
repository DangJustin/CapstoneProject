const taskManagementService = require('../services/taskManagementService');

exports.index = async (req, res, next) => {
    console.log("Task Management index");
    res.status(200).send("This is the index for the Task Management module");
  }

exports.addTask = async (req, res, next) => {
  console.log("Task Management addTask");
  try {
    const { taskName, groupID, deadlineDate, description } = req.body;

    const savedTask = await taskManagementService.addTask(taskName, groupID, deadlineDate, description);

    // Send a response with the saved task or any other appropriate response
    res.status(200).json(savedTask);
  } catch (error) {
    // Handle any errors and send an error response
    console.error('Error adding task:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

exports.getUserTasks = async (req, res, next) => {
  const userID = req.params.id;
  console.log("Task Management getUserTasks: " + String(userID));
  try{
    tasks = await taskManagementService.getUserTasks(userID);
    console.log(tasks);
    res.status(200).json(tasks);
  } catch (error){
    // Handle any errors and send an error response
    console.error('Error getting tasks:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
}

exports.getTask = async (req, res, next) => {
  const taskID = req.params.id;
  console.log("Task Management getTask: " + String(taskID));
  try {
    const task = await taskManagementService.getTask(taskID);
    res.status(200).json(task);
  } catch (error){
    res.status(500).json({ error: 'Internal Server Error' });
  }
}

exports.editTask = async (req, res, next) => {
  const taskID = req.params.id;
  console.log("Task Management editTask: " + String(taskID));
  res.status(200).send("This is the editTask for the Task Management module, taskID: " + String(taskID));
  //TODO
}

exports.completeTask = async (req, res, next) => {
  const taskID = req.params.id;
  console.log("Task Management completeTask: " + String(taskID));
  try {
    await taskManagementService.completeTask(taskID);
    res.status(200).send("Success");
  } catch (error){
    res.status(500).json({ error: 'Internal Server Error' });
  }
}

