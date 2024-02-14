import React, { useEffect, useState } from "react"
import axios from "axios"
import { useNavigate } from "react-router-dom"
import { auth } from "../firebase"
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut } from "firebase/auth"
import AuthDetails from "../AuthDetails"
import Layout from "../Layout"
import { useUser } from '../UserContext';


function Group() {
  // React hook to manage navigation between pages
  const navigate = useNavigate();
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const { currentUser, isLoading, error } = useUser();


  useEffect(() => {
    const fetchGroups = async () => {
      if (currentUser) {
        try {
          const userId = currentUser.userID;
          const response = await axios.get(`http://localhost:5000/api/database/user-groups/${userId}`);
          console.log(response.data);
          setGroups(response.data); // Set the groups in state

        } catch (error) {
          console.error('Error fetching groups:', error);
          
        } finally {
          setLoading(false);
        }
      } else {
        navigate('/account/group');
      }
    };
    fetchGroups();
  },[currentUser, groups]);

  // Function to handle creating a new group
  const handleCreateJoinGroup = async () => {
    if (!auth.currentUser) { alert('You have to be logged in to be able to join or create a group'); }
    try {
      console.log(groupName)
      console.log(currentUser.userID)
      
      const response = await axios.put(`http://localhost:5000/api/database/group/${groupName}/user/${currentUser.userID}`)
      console.log("Group successfully created/joined: ", response.data);
      alert(`Joined group: ${groupName}`);
      // refresh group list
      navigate('/account/group');
    } catch (error) {

      console.log("Error creating/joining group: ", error);
      alert('There was an error trying to join.');
    }
  };



  // State variables for managing input values and error messages
  const [groupName, setGroupName] = useState('');

  return (
    <Layout>

      <div className="login">
        <h1>My Groups</h1>
        <hr />
        <input style={{ position: 'relative', bottom: '7.5px', left: '0px' }}
          type="text"
          onChange={(e) => { setGroupName(e.target.value) }}
          placeholder="Create or join a group"
          required
        ></input><button onClick={handleCreateJoinGroup} style={{ position: 'relative', bottom: '7.5px', left: '5px' }}>
          ➕ 
        </button>
        {groups.length > 0 ? (
          groups.map(group => (
            <div key={group._id} style={{ border: '1px solid black', top: '100px', padding: '10px' }}>
              <p>{group.groupName}</p>
            </div>
          ))
        ) : (
          <p>No groups found. Try refreshing the page or click the plus sign to create or join one.</p>
        )}
      </div>
    </Layout>

  );
}

export default Group;
