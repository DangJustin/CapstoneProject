import React, { useEffect, useState } from 'react';

const UsersList = () => {
  const [groups, setGroups] = useState([]);
  const [loggedInUser, setLoggedInUser] = useState('');
  const [selectedGroup, setSelectedGroup] = useState('');

  useEffect(() => {
    const user = localStorage.getItem('username');
    if (user) {
      setLoggedInUser(user);
  
      // Fetch user groups using the username
      fetch(`http://localhost:5000/api/users/${user}/groups`)
        .then(response => response.json())
        .then(data => {
          console.log('Received data:', data); // Log the received data
          setGroups(data);
        })
        .catch(error => console.error('Error fetching user groups:', error));
    }
  }, []);
  

  const handleGroupChange = (event) => {
    setSelectedGroup(event.target.value);
  };

  return (
    <div>
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

      {/* Render details or perform actions based on the selected group */}
      {selectedGroup && (
        <div>
          <h3>Details for {selectedGroup}</h3>
          {/* Add more details or actions based on the selected group */}
        </div>
      )}
    </div>
  );
};

export default UsersList;
