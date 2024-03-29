const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema({
  taskName: {
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
  usersResponsible: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'user',
    required: true,
  }]
});

const Task = mongoose.model('Task', taskSchema);

module.exports = Task;