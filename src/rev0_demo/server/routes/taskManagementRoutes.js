const express = require('express');

// Create a router instance
const router = express.Router();
const taskManagementController = require('../controllers/taskManagementController');


router.get('/', taskManagementController.index);
router.post('/addTask',taskManagementController.addTask)
router.get('/tasks/user/:id',taskManagementController.getUserTasks);
router.get('/tasks/task/:id',taskManagementController.getTask);
router.put('/tasks/task/:id',taskManagementController.editTask);
router.put('/tasks/task/:id/complete',taskManagementController.completeTask);
router.put('/tasks/task/:id/reopen',taskManagementController.reopenTask);



module.exports = router;