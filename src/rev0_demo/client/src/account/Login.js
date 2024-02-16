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
      <div className="login container">
        <h1 className="text-center pb-5 pt-3">Welcome to Housemates!</h1>

        {!auth.currentUser && (
          <div>
            <form onSubmit={handleLoginSubmit}>
              <div className="row">
                <div className="col-md-6 offset-md-3">
                  <div className="mb-3">
                    <label className="form-label">Email:</label>
                    <input
                      type="text"
                      className="form-control"
                      onChange={(e) => { setEmail(e.target.value) }}
                      placeholder="Enter Your Email"
                      required
                    />
                  </div>
                  <div>
                    <label className="form-label">Password:</label>
                    <input
                      type="password"
                      className="form-control"
                      onChange={(e) => { setPassword(e.target.value) }}
                      placeholder="Enter Your Password"
                      required
                    />
                  </div>

                  <div className="mb-3">
                    <button type="button" className="btn btn-link" onClick={handleForgotPassword}>
                      Forgot Password?
                    </button>
                  </div>

                  <div className="text-center mb-2">
                    <button type="submit" className="btn btn-primary">Login</button>
                  </div>

                  {userDoesntExistMessage && <p className="text-danger">{userDoesntExistMessage}</p>}

                  <div className="text-center">
                    <button onClick={handleRegister} className="btn btn-link">New User? Register</button>
                  </div>
                </div>
              </div>
            </form>
          </div>
        )}

        {auth.currentUser && (
          <div className="text-center">
            <button onClick={goToHomePage} className="btn btn-primary me-2">Go to Home Page</button>
            <button onClick={handleLogout} className="btn btn-danger">Sign Out</button>
          </div>
        )}
        <AuthDetails />
      </div>
    </Layout>
  );
}

export default Login;
