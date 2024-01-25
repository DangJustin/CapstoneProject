import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import HomePage from './Homepage';
import Login from './Login';
import Account from './Account';
import TaskManagement from './TaskManagement';
import Scheduling from './Scheduling';
import BillManagement from './BillManagement';

{/* Will change links later appropriately */}
const App = () => {
  return (
    <Router>
      <Routes>
        <Route exact path="/" element={<HomePage/>} /> {/* Home page */}
        <Route path="/page1" element={<Login/>} /> {/* Task Management work */}
        <Route path="/page2" element={<Account/>} /> {/* Scheduling work */}
        <Route path="/page3" element={<TaskManagement/>} /> {/* Task Management work */}
        <Route path="/page4" element={<Scheduling/>} /> {/* Scheduling work */}
        <Route path="/page5" element={<BillManagement/>} /> {/* Bill Management work */}
      </Routes>
    </Router>
  );
};

export default App;
