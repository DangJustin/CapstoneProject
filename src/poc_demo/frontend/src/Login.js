import React, { useState } from "react"
import axios from "axios"
import { useNavigate } from "react-router-dom"

function Login() {
    // React hook to manage navigation between pages
    const navigate = useNavigate();

    // State variables for managing input values and error messages
    const [username, setUsername] = useState('');
    const [userDoesntExistMessage, setUserDoesntExistMessage] = useState('');
    const [userExistsMessage, setUserExistsMessage] = useState('');

    // Function to handle form submission for logging in
    async function handleLoginSubmit(e) {
        e.preventDefault();

        try {
            // Making a POST request to the login endpoint
            await axios.post("http://localhost:5000/api/", {
                username
            })
            .then(res => {
                // If a user object is returned, set the username in local storage and navigate to the '/users' page
                if (typeof res.data === "object") {
                    localStorage.setItem('username', res.data.username);
                    navigate("/users");
                }
                // If the response indicates that the user doesn't exist, display an error message
                else if (res.data === "notexist") {
                    setUserDoesntExistMessage("User doesn't exist. Enter correct username or create a new user.");
                }
            })
            .catch(e => {
                setUserDoesntExistMessage("User doesn't exist. Enter correct username or create a new user.")
                console.log(e);
            })
        }
        catch(e) {
            console.log(e);
        }
    }

    // Function to handle form submission for creating a new user
    async function handleNewUserSubmit(e) {
        e.preventDefault();

        try {
            // Making a POST request to the new user creation endpoint
            await axios.post("http://localhost:5000/api/newusers", {
                username
            })
            .then(res => {
                // If the response indicates that the user already exists, display an error message
                if (res.data === "exist") {
                    setUserExistsMessage("User already exists.");
                }
                // If a user object is returned, set the username in local storage and navigate to the '/users' page
                else if (typeof res.data === "object") {
                    localStorage.setItem('username', username);
                    navigate("/users");
                }
            })
            .catch(e => {
                console.log(e);
            })
        }
        catch(e) {
            console.log(e);
        }
    }

    // JSX rendering of the Login component
    return (
        <div className="login">
            <h1>Login Page</h1>

            {/* Form for creating a new user */}
            <div>
                <h2>Create New User</h2>
                <form onSubmit={handleNewUserSubmit}>
                    <input
                        type="text"
                        onChange={(e) => setUsername(e.target.value)}
                        placeholder="Enter new username"
                        required
                    />
                    <input type="submit" value="Submit" />
                </form>

                {userExistsMessage && <p>{userExistsMessage}</p>}
            </div>

            {/* Form for logging in with an existing username */}
            <div>
                <h2>Login with Existing Username</h2>
                <form action="POST" onSubmit={handleLoginSubmit}>
                    <input 
                        type="text" 
                        onChange={(e) => { setUsername(e.target.value) }} 
                        placeholder="Enter Existing Username"
                        required 
                    />

                    <input type="submit" value="Submit" />
                </form>

                {userDoesntExistMessage && <p>{userDoesntExistMessage}</p>}
            </div>
        </div>
    )
}

// Export the Login component as the default export
export default Login;
