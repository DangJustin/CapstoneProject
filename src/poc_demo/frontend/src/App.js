import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import AppForm from './AppForm'; // Assume you have a component for the form
import UsersList from './UsersList';

const App = () => {
  return (
    <Router>
      <Routes>
        <Route exact path="/" element={<AppForm/>} /> {/* Form page */}
        <Route path="/users" element={<UsersList/>} /> {/* Users List page */}
      </Routes>
    </Router>
  );
};

export default App;
