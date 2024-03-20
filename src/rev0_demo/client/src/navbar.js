import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { getAuth, onAuthStateChanged } from 'firebase/auth';

function Navbar() {
    const [currentUser, setCurrentUser] = useState(null);
    const [userInfo, setUserInfo] = useState('');
    const navigate = useNavigate();
    const auth = getAuth();

    // Function to handle form submission for signing out user
    async function handleLogout(e) {
        e.preventDefault();
        auth.signOut().then(() => {
        console.log("success");
        navigate('/account/login');
        }).catch((error) =>
        console.log(error));
    }

    const goToAccount = () => {
        navigate('/account');
      };

    useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
        setCurrentUser(user);
    });

    return () => unsubscribe();
    }, []);

    useEffect(() => {
    const fetchUserInfo = async () => {
        try {
        if (!currentUser) {
            return;
        }

        // Make a GET request to the route to grab current user info
        const response = await axios.get(`http://localhost:5000/api/database/user/${currentUser.uid}`); 

        if (!response) {
            console.error('Failed to fetch user data');
            return;
        }

        setUserInfo(response.data);
        } catch (error) {
        console.error('Error fetching user info:', error);
        }
    };

    // Call the fetchUserInfo function
    fetchUserInfo();
    }, [currentUser]);

    return (
        <div className="bootstrap-scope">
            <nav className="navbar navbar-expand-lg navbar-dark bg-dark">

                <div className="container">
                    <a className="navbar-brand" href="#">Housemates</a>
                    <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav" aria-controls="navbarNav" aria-expanded="false" aria-label="Toggle navigation">
                        <span className="navbar-toggler-icon"></span>
                    </button>

                    <div className="collapse navbar-collapse" id="navbarNav">
                        <ul className="navbar-nav">
                        <li className="nav-item">
                            <a className="nav-link" aria-current="page" href="/">Home</a>
                        </li>
                        <li className="nav-item">
                            <a className="nav-link" href="/account/group">Groups</a>
                        </li>
                        <li className="nav-item">
                            <a className="nav-link" href="/taskManagement">Tasks</a>
                        </li>
                        <li className="nav-item">
                            <a className="nav-link" href="/scheduling">Schedules</a>
                        </li>
                        <li className="nav-item">
                            <a className="nav-link" href="/billManagement">Bills</a>
                        </li>
                        </ul>
                        
                        <div className="d-lg-none">
                            {/* {currentUser && <span className="navbar-text me-2">Hello, {userInfo.email}</span>} */}
                            {currentUser && (
                                <button className="btn btn-outline-primary me-2" type="button" onClick={goToAccount}>Account</button>
                            )}
                            {currentUser ? (
                                <button className="btn btn-outline-secondary" type="button" onClick={handleLogout}>Log Out</button>
                            ) : (
                                <button className="btn btn-outline-secondary" type="button" onClick={handleLogout}>Log In</button>
                            )}
                        </div>
                    </div>

                    <div className="d-none d-lg-flex ">
                        {currentUser && <span className="navbar-text me-2">Hello, {userInfo.email} </span>}
                        {currentUser && (
                        <button className="btn btn-outline-primary me-2" type="button" onClick={goToAccount}>Account</button>
                        )}
                        {currentUser ? (
                        <button className="btn btn-outline-secondary" type="button" onClick={handleLogout}>Log Out</button>
                        ) : (
                        <button className="btn btn-outline-secondary" type="button" onClick={handleLogout}>Log In</button>
                        )}
                    </div>
                </div>
            </nav>
        </div>
    );
}

export default Navbar;
