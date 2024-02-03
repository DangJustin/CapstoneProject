import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import HomePage from './Homepage';
import Login from './account/Login';
import Register from './account/Register';
import Account from './account/Account';
import TaskManagement from './taskManagement/TaskManagement';
import Scheduling from './scheduling/Scheduling';
import BillManagement from './billManagement/BillManagement';

{/* Will change links later appropriately */}
const App = () => {
  return (
    <Router>
      <Routes>
        <Route exact path="/" element={<HomePage/>} /> {/* Home page */}
        <Route path="account" element={<Account/>} /> {/* Account work */}
        <Route path="account/login" element={<Login/>} /> {/* Task Management work */}
        <Route path="account/register" element={<Register/>} />
        <Route path="taskManagement" element={<TaskManagement/>}/> {/* Task Management Work*/}
        <Route path="scheduling" element={<Scheduling/>} /> {/* Scheduling work */}
        <Route path="billManagement" element={<BillManagement/>} /> {/* Bill Management work */}
      </Routes>
    </Router>
  );
};

export default App;
