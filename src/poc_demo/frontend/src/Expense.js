import React, { useEffect, useState } from 'react';
import axios from "axios"
import { useNavigate } from "react-router-dom"
import './styles/expense.css';

const Expense = () => {
  const navigate = useNavigate();
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [amount, setAmount] = useState('');

  useEffect(() => {
    // Fetch group information using the stored groupname
    const groupname = localStorage.getItem('groupname');

    if (groupname) {
      fetch(`http://localhost:5000/api/groups/${groupname}/users`)
        .then(response => response.json())
        .then(data => {
          setSelectedGroup(data);
        })
        .catch(error => console.error('Error fetching group information:', error));
    }
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      // Make a request to localhost:5000/api with the amount
      const res = await axios.put('http://localhost:5000/api/groups/bill_split', { amount: amount, group: selectedGroup });

      // Set the amount in local storage
      localStorage.setItem('amount', amount);

      // Navigate to the previous page
      navigate(-1);
    } catch (error) {
      console.error('Error sending amount:', error);
    }
  };

  return (
    <div className="expense">
      <h2>Expense Form</h2>
      {selectedGroup && (
        <p id='group-text'><strong>Selected Group:</strong> {selectedGroup.name}</p>
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
