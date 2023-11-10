import React, { useState } from "react"
import axios from "axios"
import { useNavigate } from "react-router-dom"


function Login() {

    const navigate = useNavigate();

    const [username, setUsername]=useState('');
    const [userDoesntExistMessage, setUserDoesntExistMessage] = useState('');
    const [userExistsMessage, setUserExistsMessage] = useState('');


    async function handleLoginSubmit(e){
        e.preventDefault();

        try{

            await axios.post("http://localhost:5000/api/",{
                username
            })
            .then(res=>{
                if(typeof res.data === "object"){
                    localStorage.setItem('username', res.data.username);
                    navigate("/users");
                }
                else if(res.data === "notexist"){
                    setUserDoesntExistMessage("User doesn't exist. Enter correct username or create a new user.");
                }
            })
            .catch(e=>{
                setUserDoesntExistMessage("User doesn't exist. Enter correct username or create a new user.")
                console.log(e);
            })

        }
        catch(e){
            console.log(e);

        }

    }

    async function handleNewUserSubmit(e) {
        e.preventDefault();

        try{

            await axios.post("http://localhost:5000/api/newusers",{
                username
            })
            .then(res=>{
                if(res.data === "exist") {
                    setUserExistsMessage("User already exists.");
                }
                else if(typeof res.data === "object") {
                    localStorage.setItem('username', username);
                    navigate("/users");
                }
            })
            .catch(e=>{
                console.log(e);
            })

        }
        catch(e){
            console.log(e);

        }
    }


    return (
        <div className="login">

            <h1>Login Page</h1>

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

export default Login;