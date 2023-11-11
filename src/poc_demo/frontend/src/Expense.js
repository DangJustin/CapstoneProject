import React, { useEffect, useState } from 'react';
import axios from "axios"
import { useNavigate } from "react-router-dom"

const Expense = () => {
  const navigate = useNavigate();
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [amount, setAmount] = useState('');

  useEffect(() => {
    // Fetch group information using the stored groupname
    const groupname = localStorage.getItem('groupname');

    if (groupname) {
      fetch(`http://localhost:5000/api/groups/${groupname}`)
        .then(response => response.json())
        .then(data => {
          console.log('Received group data:', data);
          setSelectedGroup(data);
        })
        .catch(error => console.error('Error fetching group information:', error));
    }
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      // Make a request to localhost:5000/api with the amount
      const res = await axios.post('http://localhost:5000/api', { amount, group: selectedGroup });

      // Assuming the server returns a user object
      const user = res.data.user;

      // Set the amount in local storage
      localStorage.setItem('amount', amount);

      // Navigate to the previous page
      navigate(-1);
    } catch (error) {
      console.error('Error sending amount:', error);
    }
  };

  return (
    <div>
      <h2>Expense Form</h2>
      {selectedGroup && (
        <p>Selected Group: {selectedGroup.name}</p>
      )}
      <form onSubmit={handleSubmit}>
        <label>
          Amount: 
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
          />
        </label>
        <button type="submit">Submit</button>
      </form>
    </div>
  );
};

export default Expense;
