const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema({
  TaskID: {
    type: Number,
    required: true,
    unique: true,
  },
  Taskname: {
    type: String,
    required: true,
  },
  GroupID: {
    type: Number,
    required: true,
  },
  UserID: {
    type: Number,
    required: true,
  },
  Completed: {
    type: Boolean,
    default: false,
  },
});

const Task = mongoose.model('Task', taskSchema);

module.exports = Task;