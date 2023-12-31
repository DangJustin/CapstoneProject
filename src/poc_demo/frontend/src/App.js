import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import UsersList from './UsersList';
import Login from './Login';
import Expense from './Expense';

const App = () => {
  return (
    <Router>
      <Routes>
        <Route exact path="/" element={<Login/>} /> {/* Form page */}
        <Route path="/users" element={<UsersList/>} /> {/* Users List page */}
        <Route path="/expense" element={<Expense/>} /> {/* Expense page */}
      </Routes>
    </Router>
  );
};

export default App;
