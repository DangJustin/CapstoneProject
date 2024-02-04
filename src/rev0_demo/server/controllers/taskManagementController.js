exports.index = async (req, res, next) => {
    console.log("Task Management index");
    res.status(200).send("This is the index for the Task Management module");
  }

exports.addTask = async (req, res, next) => {
  console.log("Task Management addTask");
  res.status(200).send("This is the addTasks for the Task Management module");
  //TODO
}

exports.getUserTasks = async (req, res, next) => {
  console.log("Task Management getTasks");
  res.status(200).send("This is the getTasks for the Task Management module");
  //TODO
}

exports.getTask = async (req, res, next) => {
  const taskID = req.params.id;
  console.log("Task Management getTask: " + String(taskID));
  res.status(200).send("This is the getTask for the Task Management module, taskID: " + String(taskID));
  //TODO
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
  res.status(200).send("This is the completeTask for the Task Management module, taskID: " + String(taskID));
  //TODO
}

