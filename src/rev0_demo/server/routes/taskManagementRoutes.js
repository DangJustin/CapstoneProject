const express = require('express');

// Create a router instance
const router = express.Router();
const taskManagementController = require('../controllers/taskManagementController');


router.get('/', taskManagementController.index);
router.post('/addTask',taskManagementController.addTask)
router.get('/tasks',taskManagementController.getTasks);
router.get('/tasks/task/:id',taskManagementController.getTask);
router.put('/tasks/task/:id',taskManagementController.editTask);
router.put('/tasks/task/:id/complete',taskManagementController.completeTask);



module.exports = router;