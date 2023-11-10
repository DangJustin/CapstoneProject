import React, { useEffect, useState } from 'react';

const UsersList = () => {
  // Initialize a piece of component state to hold the list of users
  const [users, setUsers] = useState([]);
  const [loggedInUser, setLoggedInUser] = useState('');

  // Use the useEffect hook to perform an asynchronous fetch request when the component mounts
  useEffect(() => {

    const user = localStorage.getItem('username');
    if (user) {
      setLoggedInUser(user);
    }
    // Send a GET request to retrieve the list of users from the server
    fetch('http://localhost:5000/api/users')
      .then(response => response.json()) // Parse the response as JSON
      .then(data => setUsers(data)) // Update the users state with the received data
      .catch(error => console.error('Error fetching users:', error)); // Handle any errors that occur during the process
  }, []); // The empty dependency array ensures that this effect runs only on component mount

  return (
    <div>
      <h1>Current user logged in: {loggedInUser}</h1>
      <h2>Users List</h2>
      
      {/* Render the list of users */}
      <ul>
        {users.map(user => (
          <li key={user._id}>{user.username}</li>
        ))}
      </ul>
    </div>
  );
};

export default UsersList;
