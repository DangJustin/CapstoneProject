import React, { useState } from "react"
// import axios from "axios"
import { useNavigate } from "react-router-dom"
import { auth } from "../firebase"
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut } from "firebase/auth"
import AuthDetails from "../AuthDetails"
import Layout from "../Layout"


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
        goToHomePage()
      }).catch((error) => {
        console.log(error);
      })

  }

  // Function to handle form submission for logging in
  async function handleForgotPassword(e) {
    e.preventDefault();
  }

  const handleRegister = () => {
    navigate('/account/register');
  };

  // Function to handle form submission for creating a new user
  // MOVE to REGISTER MODULE
  async function handleNewUserSubmit(e) {
    e.preventDefault();
    createUserWithEmailAndPassword(auth, email, password)
      .then((userCredentials) => {
        console.log(userCredentials);
      }).catch((error) => {
        console.log(error);
      })
  }

  // Function to handle form submission for signing out user
  async function handleLogout(e) {
    e.preventDefault();
    auth.signOut().then(() => {
      console.log("success");
      goToHomePage()
    }).catch((error) =>
      console.log(error));
  }

    // Function to redirect to home page
    const goToHomePage = () => {
      navigate('/');
    };

  return (
    <Layout>
      <div className="login">
        <h1>Welcome to Housemates!</h1>

        {!auth.currentUser && (
          <div>
          <h2>Login with Existing User</h2>
          <form action="POST" onSubmit={handleLoginSubmit}>
            <div>
              <input
                type="text"
                onChange={(e) => { setEmail(e.target.value) }}
                placeholder="Enter Your Email"
                required
              />
            </div>
            <div>
              <input
                type="text"
                onChange={(e) => { setPassword(e.target.value) }}
                placeholder="Enter Your Password"
                required
              />
            </div>

            <div>
              <button type="button" onClick={handleForgotPassword}>
                Forgot Password?
              </button>
            </div>
            <input type="submit" value="Login" />
          </form>

          {userDoesntExistMessage && <p id="error">{userDoesntExistMessage}</p>}

        <div className="register-container">
          <button onClick={handleRegister} className="register-button">
            New User? Register
          </button>
        </div>
        </div>

        )}

        {auth.currentUser && (
          <div>

            <button onClick={goToHomePage}>Go to Home Page</button>
            <button onClick={handleLogout}>Sign Out</button>
          </div>
        )}
        <AuthDetails />

      </div>
    </Layout>
  );
}

export default Login;
