import React, { useState } from "react"
// import axios from "axios"
import { useNavigate } from "react-router-dom"
import { auth } from "./firebase"
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from "firebase/auth"
import AuthDetails from "./AuthDetails"


function Login() {
  // React hook to manage navigation between pages
  const navigate = useNavigate();

  // State variables for managing input values and error messages
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [userDoesntExistMessage, setUserDoesntExistMessage] = useState('');
  const [userExistsMessage, setUserExistsMessage] = useState('');

  // Function to handle form submission for logging in
  async function handleLoginSubmit(e) {
      e.preventDefault();
      signInWithEmailAndPassword(auth, email, password)
      .then((userCredentials) => {
        console.log(userCredentials);
      }).catch((error) => {
        console.log(error);
      })
     
  }

  // Function to handle form submission for creating a new user
  async function handleNewUserSubmit(e) {
      e.preventDefault();
      createUserWithEmailAndPassword(auth, email, password)
      .then((userCredentials) => {
        console.log(userCredentials);
      }).catch((error) => {
        console.log(error);
      })
  }


  return (
    <div className="login">
    <h1>Welcome to Housemates!</h1>

    {/* Form for logging in with an existing username */}
    <div>
        <h2>Login with Existing User</h2>
        <form action="POST" onSubmit={handleLoginSubmit}>
            <input
                type="text"
                onChange={(e) => { setEmail(e.target.value) }}
                placeholder="Enter Your Email"
                required
            />
            <input
                type="text"
                onChange={(e) => { setPassword(e.target.value) }}
                placeholder="Enter Your Password"
                required
            />

            <input type="submit" value="Login" />
        </form>

        {userDoesntExistMessage && <p id="error">{userDoesntExistMessage}</p>}
    </div>
    {/* Form for creating a new user */}
    <div>
        <h2>Create New User</h2>
        <form onSubmit={handleNewUserSubmit}>
            <input
                type="text"
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter Your Email"
                required
            />
            <input
                type="text"
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter New Password"
                required
            />
            <input type="submit" value="Submit" />
        </form>

        {userExistsMessage && <p id="error">{userExistsMessage}</p>}
    </div>
    <AuthDetails />
</div>
  );
}

export default Login;
