import React, { useState, useEffect } from 'react';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import axios from 'axios';

const auth = getAuth();

function BillManagement() {
  const [currentUser, setCurrentUser] = useState(null);
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [allParticipants, setAllParticipants] = useState([]);
  const [selectedParticipants, setSelectedParticipants] = useState([]);
  const [groups, setGroups] = useState([]);
  const [selectedGroup, setSelectedGroup] = useState('');

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

      // Update state with only the participants of the selected group
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
      const response = await axios.post('http://localhost:5000/api/billManagement/split-expense', {
        userID: currentUser.uid,
        amount: amount,
        description,
        participants: selectedParticipants,
        groupID: selectedGroup,
      });
  
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
  
      // Fetch participants based on the selected group
      fetchGroupParticipants(selectedGroup);
  
      setAmount('');
      setDescription('');
      setSelectedParticipants([]);
      setSelectedGroup('');
    } catch (error) {
      console.error('Error adding expense. Details:', error);
    }
  };
  

  return (
    <div>
      {currentUser ? (
        <div>
          <h1>Bill Management Page</h1>
          <p>Welcome, {currentUser.email}!</p>
          <div>
            <label>
              Amount:
              <input type="text" value={amount} onChange={(e) => setAmount(e.target.value)} />
            </label>
          </div>
          <div>
            <label>
              Description:
              <input type="text" value={description} onChange={(e) => setDescription(e.target.value)} />
            </label>
          </div>
          <div>
            <label>
              Participants:
              <select multiple value={selectedParticipants.map((participant) => participant._id)} onChange={(e) => setSelectedParticipants(Array.from(e.target.selectedOptions, option => allParticipants.find(participant => participant._id === option.value)))}>
                {/* Conditionally render participants based on whether a group is selected or not */}
                {selectedGroup
                  ? allParticipants.map((user) => (
                      <option key={user._id} value={user._id}>{user.email}</option>
                    ))
                  : null}
              </select>
            </label>
          </div>
          <div>
            <label>
              Group:
              <select value={selectedGroup} onChange={(e) => setSelectedGroup(e.target.value)}>
                <option value="">Select a Group</option>
                {groups.map((group) => (
                  <option key={group._id} value={group._id}>{group.name}</option>
                ))}
              </select>
            </label>
          </div>
          <button onClick={handleAddExpense}>Add Expense</button>
        </div>
      ) : (
        <div>
          <h1>Bill Management Page</h1>
          <p>No user currently logged in.</p>
        </div>
      )}
    </div>
  );
}

export default BillManagement;