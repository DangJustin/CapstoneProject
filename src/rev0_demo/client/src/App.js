import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Login from './account/Login';
import Register from './account/Register';
import Account from './account/Account';
import Group from './account/Group';
import Editinfo from './account/Editinfo'
import HomePage from './Homepage';
import TaskManagement from './taskManagement/TaskManagement';
import AddTask from './taskManagement/AddTask';
import Task from './taskManagement/Task';
import Scheduling from './scheduling/Scheduling';
import BillManagement from './billManagement/BillManagement';
import AddBill from './billManagement/AddBill';
import ViewBill from './billManagement/ViewBill'
import EventAdd from './scheduling/EventAdd'

import { UserProvider } from './UserContext';

{/* Will change links later appropriately */ }
const App = () => {
  return (
    <UserProvider>
      <Router>
        <Routes>
          <Route exact path="/" element={<HomePage />} /> {/* Home page */}
          <Route path="account" element={<Account />} /> {/* Account work */}
          <Route path="account/login" element={<Login />} /> {/* Task Management work */}
          <Route path="account/register" element={<Register />} />
          <Route path="account/group" element={<Group />} />
          <Route path="account/editinfo" element={<Editinfo />} />
          <Route path="taskManagement" element={<TaskManagement />} /> {/* Task Management Work*/}
          <Route path="taskManagement/addTask" element={<AddTask />} /> {/*Add Task Page*/}
          <Route path="taskManagement/tasks/task/:id" element={<Task />} /> {/*View Individual Page*/}
          <Route path="scheduling" element={<Scheduling />} /> {/* Scheduling work */}
          <Route path="scheduling/eventadd" element={<EventAdd />} /> {/* Scheduling work */}
          <Route path="billManagement" element={<BillManagement />} /> {/* Bill Management work */}
          <Route path="billManagement/addExpense" element={<AddBill />} /> {/* Bill Management work */}
          <Route path="billManagement/viewExpenses" element={<ViewBill />} /> {/* Bill Management work */}
        </Routes>
      </Router>
    </UserProvider>
  );
};

export default App;
