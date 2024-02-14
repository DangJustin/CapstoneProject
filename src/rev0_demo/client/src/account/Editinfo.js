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
    axios.put(`http://localhost:5000/api/account/users/${currentUser.userID}`, {"email": currentUser.email, "username": username, "firstname": firstname, "lastname": lastname, "phone": phone})
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
      <div className="login container">
        <h1 className="text-center pb-3 pt-3">Welcome to Housemates!</h1>

        {/* Form for editing user info */}
        <div>
          <h2 className="text-center">Edit User Info</h2>
          <form onSubmit={handleEditSubmit}>
            <div className="row">
              <div className="col-md-6 offset-md-3">
                <div className="mb-3">
                  <label className="text-danger">*</label>
                  <label className="form-label">Username:</label>
                  <input
                    type="text"
                    className="form-control"
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="Choose A Username"
                    required
                  />
                </div>
                <div className="mb-3">
                  <label className="text-danger">*</label>
                  <label className="form-label">Firstname:</label>
                  <input
                    type="text"
                    className="form-control"
                    onChange={(e) => setFirstname(e.target.value)}
                    placeholder="Enter Your First Name"
                    required
                  />
                </div>
                <div className="mb-3">
                  <label className="text-danger">*</label>
                  <label className="form-label">Lastname:</label>
                  <input
                    type="text"
                    className="form-control"
                    onChange={(e) => setLastname(e.target.value)}
                    placeholder="Enter Your Last Name"
                    required
                  />
                </div>
                <div className="mb-3">
                  <label className="text-danger">*</label>
                  <label className="form-label">Phone Number:</label>
                  <input
                    type="text"
                    className="form-control"
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="Enter Your Phone Number"
                    required
                  />
                </div>

                <div className="text-center mb-2">
                  <button type="submit" className="btn btn-primary">Submit</button>
                </div>

                <div>
                  {userExistsMessage && <p id="error" className="text-danger">{userExistsMessage}</p>}
                </div>
              </div>
            </div>
          </form>
        </div>

        <AuthDetails />
      </div>
    </Layout>
  );
}

export default Editinfo;
