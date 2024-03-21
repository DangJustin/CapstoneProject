import React, { useEffect, useState } from 'react';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import axios from 'axios';
import Multiselect from 'multiselect-react-dropdown';
import presetData from './tasks.json';

const auth = getAuth();

function AddTask({ closeModal }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [selectedPreset, setSelectedPreset] = useState({});
  const [taskName, setTaskName] = useState('');
  const [selectedGroup, setSelectedGroup] = useState('');
  const [deadlineDate, setDeadlineDate] = useState('');
  const [description, setDescription] = useState('');
  const [recurring, setReccuring] = useState(false);
  const [weeks, setWeeks] = useState(1);
  const [groups, setGroups] = useState([]);
  const [allParticipants, setAllParticipants] = useState([]);
  const [usersResponsible, setUsersResponsible] = useState([]);
  const [showUserSelectionError, setShowUserSelectionError] = useState(false);
  const presets = presetData.chores;
  
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
      return [];
    }
  };

  useEffect(() => {
    fetchGroupParticipants(selectedGroup);
  }, [selectedGroup]);

  const handleAddTask = async () => {
    // Check if usersResponsible array is empty
    if (usersResponsible.length === 0) {
      // Show the popup
      setShowUserSelectionError(true);
      return;
    } else {
      setShowUserSelectionError(false);
    }

    if (!recurring) {
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
      
      if (!data) {
        console.error('Failed to add task. Data:', data);
        return;
      }

      closeModal();

    } catch (error) {
      console.error('Error adding task. Details:', error);
    }
    } else {

      // Recurring Task
      for (let i = 0; i < weeks; i++){

        // Add weeks to original date based off weeks state variable
        var date = new Date(deadlineDate);
        date.setDate(date.getDate() + 7*i);

        // add task with modified date
        try {
          const response = await axios.post('http://localhost:5000/api/taskManagement/addTask', {
            taskName: taskName,
            groupID: selectedGroup,
            deadlineDate: date,
            description: description,
            usersResponsible: usersResponsible,
          });
    
          if (response.status !== 200) {
            console.error('Unexpected response status:', response.status);
            return;
          }
      
          const data = response.data;
          
          if (!data) {
            console.error('Failed to add task. Data:', data);
            return;
          }
    
        } catch (error) {
          console.error('Error adding task. Details:', error);
        }
      }
      closeModal();
    }
  };

  const handlePreset = (presetName) => {
    for (const preset of presets){
      if (preset.name===presetName){
        setSelectedPreset(preset);
        setTaskName(preset.name);
        setDescription(preset.taskDescription);
        break;
      }
    }
  };

  const handleCheckboxChange = () => {
    setReccuring(!recurring);
  };

  const handleWeekChange = (event) => {
    setWeeks(event.target.value);
  };

  return (
    <div>
      <form onSubmit={(e) => { e.preventDefault(); handleAddTask();}}>
        
        {/* Preset Select */}
        <div className="row">
            <div className="col-md-12">
              <div className="w-75 mx-auto d-flex flex-column justify-content-center">
                <div className="mb-3">
                  <label className="form-label">Preset:</label>
                  <select className="form-select" value = {selectedPreset.name} onChange={(e) => handlePreset(e.target.value)}>
                    <option value="" disabled>Select a preset</option>
                    {presets.map((preset) => (
                      <option key={preset.name} value={preset.name}>{preset.name}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          </div>

        <div className="row">
          {/* First Column */}
          <div className="col-md-6">
            <div className="w-75 mx-auto d-flex flex-column justify-content-center">
              <div className="mb-3">
                <label className="text-danger">*</label>
                <label className="form-label">Task Name:</label>
                <input type="text" className="form-control" required value={taskName} onChange={(e) => setTaskName(e.target.value)} />
              </div>
              
              <div className="mb-3">
                <label className="text-danger">*</label>
                <label className="form-label">Deadline Date:</label>
                <input type="date" className="form-control" required value={deadlineDate} onChange={(e) => setDeadlineDate(e.target.value)} />
              </div>

            </div>
            
          </div>

          {/* Second Column */}
          <div className="col-md-6">
            <div className="w-75 mx-auto d-flex flex-column justify-content-center">
              <div className="mb-3">
                <label className="text-danger">*</label>
                <label className="form-label">Select Group:</label>
                  <select className="form-select" value={selectedGroup} required onChange={(e) => setSelectedGroup(e.target.value)}>
                    <option value="" disabled>Select a group</option>
                    {groups.map((group) => (
                      <option key={group._id} value={group._id}>{group.groupName}</option>
                    ))}
                  </select>
              </div>

              <div className="mb-3">
                <label className="text-danger">*</label>
                <label className="form-label">Select Users:</label>
                  <Multiselect
                    options={allParticipants.map((user) => ({ value: user._id, label: user.username }))}
                    selectedValues={usersResponsible.map((userId) => ({ value: userId, label: allParticipants.find((user) => user._id === userId).username }))}
                    onSelect={(selectedList) => setUsersResponsible(selectedList.map((user) => user.value))}
                    onRemove={(selectedList) => setUsersResponsible(selectedList.map((user) => user.value))}
                    displayValue="label"
                    showCheckbox={true}
                    closeIcon="cancel"
                    placeholder={selectedGroup ? "Select users" : "Select group first"}
                    required
                  />
                  
              </div>

            </div>

          </div>

          {/* Description Box Spanning Both Columns */}
          <div className="row">
            <div className="col-md-12">
              <div className="w-75 mx-auto d-flex flex-column justify-content-center">
                <div className="mb-3">
                  <label className="form-label">Description:</label>
                  <textarea className="form-control" rows="3" value={description} onChange={(e) => setDescription(e.target.value)} />
                </div>
              </div>
            </div>
          </div>

          {/* Reccuring Task */}
          <div className="row">
              <div className="col-md-12">
                <div className="w-75 mx-auto d-flex flex-column justify-content-center">
                  <div className="mb-3 form-check">
                    <input type="checkbox" className="form-check-input" checked={recurring} onChange={handleCheckboxChange} />
                    <label className="form-check-label">Recurring Task</label>
                  </div>
                  {recurring && (<div className='mb-3'>
                  <label className="form-label"># of weeks</label>
                  <input type="number" min="1" className="form-control" value={weeks} onChange={handleWeekChange}/>
                  </div>)}
                </div>
              </div>
            </div>

          {/* Move the buttons to the center */}
          <div className="d-flex justify-content-center pt-">
              <button type="submit" className="btn btn-primary me-2">Add Task</button>
            </div>
        </div>
      </form>

      {/* Popup for user selection error */}
      {showUserSelectionError && (
        <div className="alert alert-danger mt-3">
          Please select at least one user.
        </div>
      )}

    </div>
  );
}

export default AddTask;
