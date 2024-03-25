import React, { useEffect, useState } from "react";
import { useNavigate, NavLink, useLocation } from "react-router-dom";
import axios from "axios";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import ClosePng from "./images/close.png";
import "./sidebar.css";

function Sidebar() {
  const [currentUser, setCurrentUser] = useState(null);
  const [userInfo, setUserInfo] = useState("");
  const navigate = useNavigate();
  const auth = getAuth();
  const location = useLocation();
  const logo = require("./images/logo.png");

  // Function to handle form submission for signing out user
  async function handleLogout(e) {
    e.preventDefault();
    auth
      .signOut()
      .then(() => {
        console.log("success");
        navigate("/account/login");
      })
      .catch((error) => console.log(error));
  }

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
        const response = await axios.get(
          `http://localhost:5000/api/database/user/${currentUser.uid}`
        );

        if (!response) {
          console.error("Failed to fetch user data");
          return;
        }

        setUserInfo(response.data);
      } catch (error) {
        console.error("Error fetching user info:", error);
      }
    };

    // Call the fetchUserInfo function
    fetchUserInfo();
  }, [currentUser]);

  return (
    <div className="container sidebarPage">
      <div className="content mt-2">
        <button
          onClick={() =>
            document
              .getElementsByClassName("sidebar")[0]
              .classList.toggle("collapsed")
          }
        >
          <div></div>
          <div></div>
          <div></div>
        </button>
      </div>
      <div className="sidebar" id="sidebar">
      <button
            className="btnCheck close-btn"
            onClick={() => {
              document
                .getElementsByClassName("sidebar")[0]
                .classList.toggle("collapsed");
            }}
          >
            <img
              src={ClosePng}
              alt="Close side bar"
              style={{
                width: "20px",
                height: "20px",
              }}
            />
          </button>
        <div id="head">
          <p className="logo">Housemates</p>
        </div>
        <ul className="list my-4">
          <li>
            <NavLink
              className={`nav-link ${
                location.pathname === "/account/group" ? "active" : ""
              }`}
              to="/account/group"
            >
              Groups
            </NavLink>
          </li>
          <li>
            <NavLink
              className={`nav-link ${
                location.pathname === "/taskManagement" ? "active" : ""
              }`}
              to="/taskManagement"
            >
              Tasks
            </NavLink>
          </li>
          <li>
            <NavLink
              className={`nav-link ${
                location.pathname === "/scheduling" ? "active" : ""
              }`}
              to="/scheduling"
            >
              Schedules
            </NavLink>
          </li>
          <li>
            <NavLink
              className={`nav-link ${
                location.pathname === "/billManagement" ? "active" : ""
              }`}
              to="/billManagement"
            >
              Bills
            </NavLink>
          </li>
          <li>
            <NavLink
              className={`nav-link ${
                location.pathname === "/account" ? "active" : ""
              }`}
              to="/account"
            >
              Account
            </NavLink>
          </li>
          <li>
            {currentUser ? (
              <button
                className="btn btn-outline-secondary"
                type="button"
                onClick={handleLogout}
              >
                Log Out
              </button>
            ) : (
              <button
                className="btn btn-outline-secondary"
                type="button"
                onClick={handleLogout}
              >
                Log In
              </button>
            )}
          </li>
        </ul>
      </div>
    </div>
  );
}

export default Sidebar;
