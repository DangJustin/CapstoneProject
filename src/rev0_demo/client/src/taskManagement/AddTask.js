import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import axios from 'axios';

const auth = getAuth();

function AddTask() {
  const [currentUser, setCurrentUser] = useState(null);
  const [taskName, setTaskName] = useState('');
  const [selectedGroup, setSelectedGroup] = useState('');
  const [deadlineDate, setDeadlineDate] = useState('');
  const [description, setDescription] = useState('');
  const [groups, setGroups] = useState([]);
  const [allParticipants, setAllParticipants] = useState([]);
  const [usersResponsible, setUsersResponsible] = useState([]);
  const navigate = useNavigate();

  //Checking if user is logged in
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
    });

    return () => unsubscribe();
  }, []);

  //Grabbing all groups user is part of
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        if (!currentUser) {
          console.error('No user currently logged in.');
          return;
        }

        const groupsResponse = await axios.get(`http://localhost:5000/api/database/user-groups/${currentUser.uid}`);

        if (!groupsResponse) {
          console.error('Failed to fetch group data');
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
      const response = await axios.get(`http://localhost:5000/api/database/group-participants/${groupId}/all-users/${currentUser.uid}`);
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

  const handleAddTask = async () => {

    try {
      const response = await axios.post('http://localhost:5000/api/taskManagement/addTask', {
        taskName: taskName,
        groupID: selectedGroup,
        deadlineDate: deadlineDate,
        description: description,
        usersResponsible: usersResponsible,
      });

      if (response.status !== 200) {
        console.error('Unexpected response status:', response.status);
        return;
      }
  
      const data = response.data;
  
      if (!data || data.success !== true) {
        console.error('Failed to add task. Data:', data);
        return;
      }

    } catch (error) {
      console.error('Error adding task. Details:', error);
    }
  };

  const goToTaskManagement = () => {
    navigate('/taskManagement');
  };

  // Event handler for selecting users responsible
  const handleUsersResponsibleChange = (e) => {
    const selectedUserIds = Array.from(e.target.selectedOptions, (option) => option.value);
    setUsersResponsible(selectedUserIds);
  };

  return (
    <div>
      <h1>Add Task Page</h1>
      <form onSubmit={(e) => { e.preventDefault(); handleAddTask(); goToTaskManagement();}}>
        <label>
          Task Name:
          <input type="text" required value={taskName} onChange={(e) => setTaskName(e.target.value)} />
        </label>
        <br />

        <label>
          Select Group:
          <select value={selectedGroup} required onChange={(e) => setSelectedGroup(e.target.value)}>
            <option value="" disabled>Select a group</option>
            {groups.map((group) => (
              <option key={group._id} value={group._id}>{group.groupName}</option>
            ))}
          </select>
        </label>
        <br />

        <label>
          Deadline Date:
          <input type="date" required value={deadlineDate} onChange={(e) => setDeadlineDate(e.target.value)} />
        </label>
        <br />

        <div>
          <label>
            Select Users Responsible:
            <select multiple value={usersResponsible} onChange={(e) => setUsersResponsible(Array.from(e.target.selectedOptions, option => option.value))}>
              {/* Conditionally render participants based on whether a group is selected or not */}
              {selectedGroup
                ? allParticipants.map((user) => (
                    <option key={user._id} value={user._id}>{user.username}</option>
                  ))
                : null}
            </select>
          </label>
        </div>

        {/* Show selected users responsible as text */}
        <div>
          Users: 
          {usersResponsible.map(userId => {
            // Find the user object with the corresponding ID
            const user = allParticipants.find(participant => participant._id === userId);
            // Return the username if user object is found, otherwise return an empty string
            return user ? <span key={userId}> {user.username} </span> : null;
          })}
        </div>

        <label>
          Description:
          <textarea value={description} onChange={(e) => setDescription(e.target.value)} />
        </label>
        <br />

        <button type="submit">Add Task</button>
        <button type="button" onClick={goToTaskManagement}>Cancel</button>
      </form>
    </div>
  );
}

export default AddTask;
