import React, { useState, useEffect } from 'react';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import axios from 'axios';
import Layout from '../Layout';

const auth = getAuth();

function AddBill() {
  const [currentUser, setCurrentUser] = useState(null);
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [allParticipants, setAllParticipants] = useState([]);
  const [selectedParticipants, setSelectedParticipants] = useState([]);
  const [groups, setGroups] = useState([]);
  const [selectedGroup, setSelectedGroup] = useState('');
  const [splitUnevenly, setSplitUnevenly] = useState(false); // State variable for uneven split

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        if (!currentUser) {
          console.error('No user currently logged in.');
          return;
        }

        const groupsResponse = await axios.get(`http://localhost:5000/api/database/user-groups/${currentUser.uid}`);

        if (!groupsResponse) {
          console.error('Failed to fetch user or group data');
          return;
        }

        const groupsData = groupsResponse.data;

        setGroups(groupsData);
      } catch (error) {
        console.error('Error fetching user data:', error);
      }
    };

    fetchUserData();
  }, [currentUser]);

  const fetchGroupParticipants = async (groupId) => {
    try {
      const response = await axios.get(`http://localhost:5000/api/database/group-participants/${groupId}/user/${currentUser.uid}`);
      if (!response || !response.data) {
        console.error('Failed to fetch group participants:', response);
        return [];
      }

      const groupParticipants = response.data;

      setAllParticipants(groupParticipants);

      return groupParticipants;
    } catch (error) {
      console.error('Error fetching group participants:', error);
      return [];
    }
  };

  useEffect(() => {
    fetchGroupParticipants(selectedGroup);
  }, [selectedGroup]);

  const handleAddExpense = async () => {
    try {
      let expenseData = {
        userID: currentUser.uid,
        amount: amount,
        description,
        participants: selectedParticipants,
        groupID: selectedGroup,
      };

      // If split unevenly, include individual expense amounts
      if (splitUnevenly) {
        const individualAmounts = selectedParticipants.map(participant => participant.individualAmount);
        const totalIndividualAmounts = individualAmounts.reduce((acc, val) => acc + parseFloat(val), 0);
        if (totalIndividualAmounts > parseFloat(amount)) {
          console.error('Individual expense amounts exceed the total amount.');
          return;
        }
        expenseData.individualAmounts = individualAmounts;
      }
      
      const response = await axios.post('http://localhost:5000/api/billManagement/split-expense', expenseData);
  
      if (response.status !== 200) {
        console.error('Unexpected response status:', response.status);
        return;
      }
  
      const data = response.data;
  
      if (!data || data.success !== true) {
        console.error('Failed to add expense. Data:', data);
        return;
      }
  
      console.log(data.message);
  
      fetchGroupParticipants(selectedGroup);
  
      setAmount('');
      setDescription('');
      setSelectedParticipants([]);
      setSelectedGroup('');
      setSplitUnevenly(false); // Reset splitUnevenly state
    } catch (error) {
      console.error('Error adding expense. Details:', error);
    }
  };
  

  return (
    <Layout>
      <div className="container">
        {currentUser ? (
          <div>
            <h1 className="mt-3">Bill Management Page</h1>
            <p className="mt-3">Welcome, {currentUser.email}!</p>
            <div className="mt-3">
              <label>Amount:</label>
              <input type="text" value={amount} onChange={(e) => setAmount(e.target.value)} className="form-control" />
            </div>
            <div className="mt-3">
              <label>Description:</label>
              <input type="text" value={description} onChange={(e) => setDescription(e.target.value)} className="form-control" />
            </div>
            <div className="mt-3">
              <label>Participants:</label>
              <select multiple value={selectedParticipants.map((participant) => participant._id)} onChange={(e) => setSelectedParticipants(Array.from(e.target.selectedOptions, option => allParticipants.find(participant => participant._id === option.value)))} className="form-control">
                {selectedGroup
                  ? allParticipants.map((user) => (
                      <option key={user._id} value={user._id}>{user.email}</option>
                    ))
                  : null}
              </select>
            </div>
            <div className="mt-3">
              <label>Group:</label>
              <select value={selectedGroup} onChange={(e) => setSelectedGroup(e.target.value)} className="form-control">
                <option value="">Select a Group</option>
                {groups.map((group) => (
                  <option key={group._id} value={group._id}>{group.groupName}</option>
                ))}
              </select>
            </div>
            <div className="mt-3">
              <label>Split Unevenly:</label>
              <input type="checkbox" checked={splitUnevenly} onChange={() => setSplitUnevenly(!splitUnevenly)} className="form-check-input" />
            </div>
            {splitUnevenly && (
              <div className="mt-3">
                {selectedParticipants.map(participant => (
                  <div key={participant._id} className="mt-2">
                    <label>{participant.email}:</label>
                    <input type="text" value={participant.individualAmount || ''} onChange={(e) => {
                      const updatedParticipants = selectedParticipants.map(p => {
                        if (p._id === participant._id) {
                          return { ...p, individualAmount: e.target.value };
                        }
                        return p;
                      });
                      setSelectedParticipants(updatedParticipants);
                    }} className="form-control" />
                  </div>
                ))}
              </div>
            )}
            <button onClick={handleAddExpense} className="btn btn-primary mt-3">Add Expense</button>
          </div>
        ) : (
          <div>
            <h1 className="mt-3">Bill Management Page</h1>
            <p className="mt-3">No user currently logged in.</p>
          </div>
        )}
      </div>
    </Layout>
  );
}

export default AddBill;
