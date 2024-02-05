const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema({
  taskID: {
    type: Number,
    required: true,
    unique: true,
  },
  taskname: {
    type: String,
    required: true,
  },
  description: {
    type: String,
  },
  groupID: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Group',
    required: true,
  },
  completed: {
    type: Boolean,
    default: false,
  },
  createdDate: {
    type: Date,
    default: Date.now,
  },
  deadlineDate: {
    type: Date,
    required: true,
  },
});

const Task = mongoose.model('Task', taskSchema);

module.exports = Task;