const db = require('./db');
const User = require('../models/userModel');
const Task = require('../models/taskModel');
const Group = require('../models/groupModel');
const taskManagementService = require('../services/taskManagementService');
const accountService = require('../services/accountService');

// Have This block before the tests
beforeAll(async () => {await db.connect()});
afterAll(async () => {await db.disconnect()});
afterEach(async () => {await db.clearDatabase()});
beforeEach(async () => {
    //Add 2 new users
    const userID1 = "111111111";
    const userID2 = "222222222";
    const email1 = "testTask1@gmail.com";
    const email2 = "testTask2@gmail.com";
    const username1 = "testTask1";
    const username2 = "testTask2";
    const firstname = "Test";
    const lastname = "Task";
    const phone = "1234567890";
    const user1 = await User.create({ userID: userID1, email: email1, username: username1, firstname, lastname, phone });
    const user2 = await User.create({ userID: userID2, email: email2, username: username2, firstname, lastname, phone });

    //Add new group and users to group
    const groupName = "Test Create Task";
    let group = new Group({ groupName: groupName, users: [] });
    group.users.push(user1._id, user2._id);
    await group.save();

    // Add Another Group
    const groupName2 = "Test Create Task 2";
    let group2 = new Group({ groupName: groupName2, users: [] });
    group2.users.push(user1._id);
    await group2.save();

    //Add new tasks
    const task1 = await taskManagementService.addTask("Random task 1", group._id, new Date(), "Another task", [user1._id, user2._id]);
    const task2 = await taskManagementService.addTask("Random task 2", group2._id, new Date(), "This is random task", [user1._id]);
});

describe('Task Management Tests', () => {
    describe('Create New Task', () => {
        it('Should create new task and check if it exists with same properties', async () => {
            const taskName = "New Test Task";
            const description = "This is a new test task";
            const user1 = await accountService.getUser("111111111");
            const user2 = await accountService.getUser("222222222");
            const usersResponsible = [user2._id];
            const group = await accountService.getUserGroups("222222222");
    
            //Add new task
            const orginal_task = await taskManagementService.addTask(taskName, group[0]._id, new Date("2/20/2025"), description, usersResponsible);
    
            // Get new task
            const task = await Task.findById(orginal_task._id);
    
            
    
            expect(task.taskName).toEqual("New Test Task");
            expect(task.groupID).toEqual(group[0]._id);
            expect(task.usersResponsible.length).toEqual(1);
            expect(task.usersResponsible[0]).toEqual(user2._id);
            expect(task.usersResponsible[0]).not.toEqual(user1._id);
            expect(task.description).toEqual("This is a new test task");
            expect(task.deadlineDate.toLocaleDateString()).toEqual(new Date("2/20/2025").toLocaleDateString());
        });
    });
    
    
    describe('Get User Tasks', () => {
        it('Should get user tasks', async () => {
    
           // Get User Tasks for user 1 and 2
           let tasks1 = await taskManagementService.getUserTasks("111111111");
           let tasks2 = await taskManagementService.getUserTasks("222222222");
    
           // Expect user 1 to have 2 tasks and user 2 to have 1  tasks
           expect(tasks1.length).toEqual(2);
           expect(tasks2.length).toEqual(1);
        });
    });
    
    describe('Complete task', () => {
        it('Should be able to mark a task as completed', async () => {
            let tasks = await taskManagementService.getUserTasks("111111111");
    
            //mark task 2 as completed
            await taskManagementService.completeTask(tasks[1]._id);
    
            //grab tasks again
            tasks = await taskManagementService.getUserTasks("111111111");
    
            expect(tasks[0].completed).toBeFalsy(); //task incomplete
            expect(tasks[1].completed).toBeTruthy(); //task complete
        });
    });
    
    
    describe('Edit Task', () => {
    
        it('Should be able to edit task details', async () => {
            let tasks = await taskManagementService.getUserTasks("111111111");
            const taskData = {
                _id: tasks[0]._id,
                taskName: "Updated task name",
                description: "Updated description",
                deadlineDate: new Date("3/30/2024")
            };
            await taskManagementService.editTask(taskData);
            //grab tasks again
            tasks = await taskManagementService.getUserTasks("111111111");
    
            expect(tasks[0].taskName).toEqual("Updated task name");
            expect(tasks[0].description).toEqual("Updated description");
            expect(tasks[0].deadlineDate.toLocaleDateString()).toEqual(new Date("3/30/2024").toLocaleDateString());
        });
    });
});

