import React, { useState } from "react"
// import axios from "axios"
import axios from 'axios';
import { useNavigate } from "react-router-dom"
import { auth } from "../firebase"
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut } from "firebase/auth"
import AuthDetails from "../AuthDetails"
import Layout from "../Layout";
import { useUser } from "../UserContext";

function Editinfo() {
  // React hook to manage navigation between pages
  const navigate = useNavigate();

  const { currentUser, isLoading, error } = useUser();

  // State variables for managing input values and error messages
  const [username, setUsername] = useState('');
  const [firstname, setFirstname] = useState('');
  const [lastname, setLastname] = useState('');
  const [phone, setPhone] = useState('');

  const [userExistsMessage, setUserExistsMessage] = useState('');

  // Function to handle form submission for creating a new user
  async function handleEditSubmit(e) {
    e.preventDefault();
    console.log()
    const usrid = await axios.get()
    axios.put(`http://localhost:5000/api/account/users/${currentUser.userID}`, {"username": username, "fisrtname": firstname, "lastname": lastname, "phone":phone})
      .then(response => {
        console.log('User added to the database', response.data);
      })
      .catch(error => {
        console.error('Error adding user to the database', error);
      });

  }
  const goToHomePage = () => {
    navigate('/');
  };


  return (
    <Layout>
      <div className="login">
        <h1>Welcome to Housemates!</h1>

        {/* Form for logging in with an existing username */}

        {/* Form for creating a new user */}
        <div>
          <h2>Edit User Info</h2>
          <form onSubmit={handleEditSubmit}>
            <div>
              <input
                type="text"
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Choose A Username"
                required
              />
            </div>
            <div>
              <input
                type="text"
                onChange={(e) => setFirstname(e.target.value)}
                placeholder="Enter Your First Name"
                required
              />
            </div>
            <div>
              <input
                type="text"
                onChange={(e) => setLastname(e.target.value)}
                placeholder="Enter Your Last Name"
                required
              />
            </div>
            <div>
              <input
                type="text"
                onChange={(e) => setPhone(e.target.value)}
                placeholder="Enter Your Phone Number"
                required
              />
            </div>
            <input type="submit" value="Submit" />
          </form>

          <div>
            {userExistsMessage && <p id="error">{userExistsMessage}</p>}
          </div>
        </div>

        <AuthDetails />
      </div>
    </Layout>
  );
}

export default Editinfo;
