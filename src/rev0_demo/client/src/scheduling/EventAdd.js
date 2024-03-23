import React, { useState, useEffect } from "react"
// import axios from "axios"
import { useNavigate } from "react-router-dom"
import { auth } from "../firebase"
import { getAuth, onAuthStateChanged } from 'firebase/auth';
// import { signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut } from "firebase/auth"
import AuthDetails from "../AuthDetails"
import Layout from "../Layout"
import axios from "axios"
import { useUser } from '../UserContext';
import Multiselect from 'multiselect-react-dropdown';

function EventAdd() {

  // const { presentUser, isLoading, error } = useUser();
  const [currentUser, setCurrentUser] = useState(null);
  
  // State variables for managing input values and error messages
  const [eventName, setEventName] = useState('');
  const [dateTime, setDateTime] = useState('');
  const [endDateTime, setEndDateTime] = useState('');
  const [minutes, setMinutes] = useState(0);
  const [groupName, setGroupName] = useState('');
  const [groupid, setGroupid] = useState();
  const [groups, setGroups] = useState([]);

  // React hook to manage navigation between pages
  const navigate = useNavigate();

  const goToLogin = () => {
    navigate('/account/login');
  };

  const handleEventSubmit = async (e) => {
    e.preventDefault();

    try {
      console.log(currentUser)
      const groupInvolvedRes = await axios.get(`http://localhost:5000/api/database/user-groups/${currentUser.uid}`);
      console.log("made it here")
      var listOfGroups = [];
      const n = (groupInvolvedRes.data).length;
      for (var i = 0; i < n; i++) { listOfGroups.push((groupInvolvedRes.data)[i]._id); }

      if (!listOfGroups.includes(groupName)) {
        alert("You can only add an event to a group you are in!");
        return;
      }

    } catch (error) {
      alert(error)
      alert("Failed checking group authentication")

    }

    try {
      console.log("HERE")
      console.log(groupName)
      console.log("HERE")

    } catch (error) {
      console.error('Error fetching group: ', error);
      alert('Failed to get the group details.');
      return;
    }

    // Convert dateTime string to a Date object
    const eventDateTime = new Date(dateTime);
    const eventEndDateTime = new Date(endDateTime);

    // Create event object
    const event = {
      "eventname": eventName,
      "datetime": eventDateTime.toISOString(),
      "enddatetime": eventEndDateTime.toISOString(),
      "groupID": groupName
    };

    axios.post('http://localhost:5000/api/scheduling/', event)
      .then(response => {
        console.log('Event added to the database', response.data);
      })
      .catch(error => {
        console.error('Error adding event to the database', error);
      });

    navigate("/scheduling")
  }

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
    });

    return () => unsubscribe();
  }, []);


  useEffect(() => {
    const fetchUserData = async () => {
      try {
        if (!currentUser) {
          return;
        }

        const groupsResponse = await axios.get(`http://localhost:5000/api/database/user-groups/${currentUser.uid}`);

        if (!groupsResponse) {
          console.error('Failed to fetch group data');
          return;
        }

        const groupsData = groupsResponse.data;

        setGroups(groupsData);
      } catch (error) {
        console.error('Error fetching user data:', error);
      }
    };

    fetchUserData();
  }, [currentUser]);

  return (
    <Layout>
      <div className="container">
        <h1 className="text-center pb-3 pt-3">Add an Event!</h1>
        {!auth.currentUser && (
          <div className="row">
            <div className="col-md-6 offset-md-3">
              <div className="mb-3">
                <h2 className="text-center mb-3">Login first, you are not logged in!</h2>

                <div className="text-center mb-3">
                  <button className="btn btn-primary" onClick={goToLogin}>Login</button>
                </div>
              </div>
            </div>
          </div>
        )}

        {auth.currentUser && (
          <div>
            <form onSubmit={handleEventSubmit}>
              <div className="row">
                <div className="col-md-6 offset-md-3">
                  <div className="mb-3">
                    <label className="text-danger">*</label>
                    <label htmlFor="eventName" className="form-label">Event Title</label>
                    <input
                      type="text"
                      className="form-control"
                      id="eventName"
                      onChange={(e) => { setEventName(e.target.value) }}
                      placeholder="Enter your event title"
                      required
                    />
                  </div>

                  <div className="mb-3">
                    <label className="text-danger">*</label>
                    <label htmlFor="dateTime" className="form-label">Start Date and Time</label>
                    <input
                      type="datetime-local"
                      className="form-control"
                      id="dateTime"
                      onChange={(e) => { setDateTime(e.target.value) }}
                      required
                    />
                  </div>

                  <div className="mb-3">
                    <label className="text-danger">*</label>
                    <label htmlFor="dateTime" className="form-label">End Date and Time</label>
                    <input
                      type="datetime-local"
                      className="form-control"
                      id="dateTime"
                      onChange={(e) => { setEndDateTime(e.target.value) }}
                      required
                    />
                  </div>



                  <div className="mb-3">
                    <label className="text-danger">*</label>
                    <label className="form-label">Select Group:</label>
                    <select className="form-select" value={groupName} required onChange={(e) => setGroupName(e.target.value)}>
                      <option value="" disabled>Select a group</option>
                      {groups.map((group) => (
                        <option key={group._id} value={group._id}>{group.groupName}</option>
                      ))}
                    </select>
                  </div>

                  <div className="text-center mb-2">
                    <button type="submit" className="btn btn-primary">Add Event</button>
                  </div>
                </div>
              </div>
            </form>
          </div>
        )}
      </div>
    </Layout>
  );
}

export default EventAdd;