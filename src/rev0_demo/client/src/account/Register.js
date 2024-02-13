import React, { useState } from "react"
// import axios from "axios"
import axios from 'axios';
import { useNavigate } from "react-router-dom"
import { auth } from "../firebase"
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut } from "firebase/auth"
import AuthDetails from "../AuthDetails"
import Layout from "../Layout";


function Register() {
  // React hook to manage navigation between pages
  const navigate = useNavigate();

  // State variables for managing input values and error messages
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [firstname, setFirstname] = useState('');
  const [lastname, setLastname] = useState('');
  const [phone, setPhone] = useState('');

  const [userExistsMessage, setUserExistsMessage] = useState('');

  // Function to handle form submission for creating a new user
  async function handleNewUserSubmit(e) {
    e.preventDefault();

    createUserWithEmailAndPassword(auth, email, password)
      .then((userCredentials) => {
        console.log(userCredentials.user.uid);
        goToHomePage()
        // axios post email, uid, username first and last name and phone
        const userData = {
          "userID": userCredentials.user.uid,
          "email": email,
          "username": username,
          "firstname": firstname,
          "lastname": lastname,
          "phone": phone,
          "amount": 0.0
        };
        const tnp = 0.0
        const tmp = (userCredentials.user.uid)
        console.log(userData.userID)
        console.log(typeof userData.userID)


        axios.post('http://localhost:5000/api/account', userData )
        .then(response => {
          console.log('User added to the database', response.data);
        })
        .catch(error => {
          console.error('Error adding user to the database', error);
        });
      }).catch((error) => {
        console.log(error);

      })
  }

  // Function to handle form submission for signing out user
  async function handleLogout(e) {
    e.preventDefault();
    auth.signOut().then(() => {
      console.log("success");
    }).catch((error) =>
      console.log(error));
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
          <h2>Create New User</h2>
          <form onSubmit={handleNewUserSubmit}>
            <div>
              <input
                type="text"
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter Your Email"
                required
              />
            </div>
            <div>
              <input
                type="text"
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter New Password"
                required
              />
            </div>
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

export default Register;
