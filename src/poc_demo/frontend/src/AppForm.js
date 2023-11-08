import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const AppForm = () => {
  // Initialize a piece of component state to hold the username input
  const [username, setUsername] = useState('');

  // Initialize the navigate object using useNavigate
  const navigate = useNavigate();

  // Define a function to handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      // Send a POST request to the server to create a new user
      const response = await fetch('http://localhost:5000/api/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username }),
      });

      // Parse the response as JSON
      const data = await response.json();

      // Log a message indicating the user was created
      console.log('User created:', data);

      // Redirect to the Users List page using the navigate object
      navigate('/users');
    } catch (error) {
      console.error('Error creating user:', error);
    }
  };

  return (
    <div>
      <h1>Enter Your Username</h1>
      <form onSubmit={handleSubmit}>
        {/* Input field for entering the username */}
        <input
          type="text"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />
        <button type="submit">Submit</button>
      </form>
    </div>
  );
};

export default AppForm;
