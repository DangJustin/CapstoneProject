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
    // Function to fetch groups
    const fetchGroups = async () => {
      // Make sure the user is logged in
      if (currentUser) {
        try {
          // Get the user's ID from the auth state
          const userId = currentUser.userID;
          // Replace 'http://yourserver.com' with your actual server's URL
          const response = await axios.get(`http://localhost:5000/api/database/user-groups/${userId}`);
          setGroups(response.data); // Set the groups in state
        } catch (error) {
          console.error('Error fetching groups:', error);
          // Handle error, e.g., by setting an error state or notifying the user
        } finally {
          setLoading(false); // Set loading to false regardless of the outcome
        }
      } else {
        navigate('/login'); // If not logged in, redirect to the login page
      }
    };

    fetchGroups();
  }, [navigate]);

  // State variables for managing input values and error messages
  // const [email, setEmail] = useState('');

  return (
    <Layout>

      <div className="login">
        <h1>My Groups</h1>
        <hr></hr>
        {loading ? (
          <p>Loading groups...</p>
        ) : (
          groups.map(group => (
            <div key={group._id}>
              <p>{group.groupName}</p>
              {/* Render other group details as needed */}
            </div>
          ))
        )}
      </div>
    </Layout>

  );
}

export default Group;
