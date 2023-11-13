import React, { useEffect, useState } from 'react';
import { useNavigate } from "react-router-dom";
import './styles/usersList.css';

const UsersList = () => {
  const [groups, setGroups] = useState([]);
  const [loggedInUser, setLoggedInUser] = useState('');
  const [selectedGroup, setSelectedGroup] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const user = localStorage.getItem('username');
    if (user) {
      setLoggedInUser(user);
  
      // Fetch user groups using the username
      fetch(`http://localhost:5000/api/users/${user}/groups`)
        .then(response => response.json())
        .then(data => {
          setGroups(data);
        })
        .catch(error => console.error('Error fetching user groups:', error));
    }
  }, []);
  

  const handleGroupChange = (event) => {
    // Fetch Users for Selected Group
    fetch(`http://localhost:5000/api/groups/${event.target.value}/users`)
        .then(response => response.json())
        .then(data => {
          setSelectedGroup(data);
          localStorage.setItem('groupname',data.name); // Store selected group's name
        })
        .catch(error => console.error('Error fetching user groups:', error));
  };

  return (
    <div className="usersList">
      <h1>Current user logged in: {loggedInUser}</h1>
      <h3>Select group to view more details</h3>
      <h2>Group List</h2>

      {/* Render the dropdown menu */}
      <select value={selectedGroup} onChange={handleGroupChange}>
        <option value="">Select a group</option>
        {groups.map(group => (
          <option key={group._id} value={group.name}>{group.name}</option>
        ))}
      </select>

      {/* Table of User Details for Selected Group */}
      {selectedGroup.name && (
        <div>
          <h3>Details for {selectedGroup.name}</h3>
          <table>
      <thead>
        <tr>
          <th>Name</th>
          <th>Amount Owed</th>
        </tr>
      </thead>
      <tbody>
        {selectedGroup.users.map((user) => (
          <tr key={user._id}>
            <td>{user.username}</td>
            <td>${(user.amount).toFixed(2)}</td>
          </tr>
        ))}
      </tbody>
    </table>
        </div>
      )}

      {/* Button to navigate to Expense Page */}
      <button style={{ position: 'absolute', bottom: '20px', right: '20px', width: '150px', height: '50px', fontSize: '16px'}} type="button" onClick={() => navigate("/expense")}>
          Add Expense
      </button>
    </div>
  );
};

export default UsersList;
