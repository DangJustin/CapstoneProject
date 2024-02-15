import React, { useState } from "react"
// import axios from "axios"
import { useNavigate } from "react-router-dom"
import { auth } from "../firebase"
// import { signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut } from "firebase/auth"
import AuthDetails from "../AuthDetails"
import Layout from "../Layout"
import axios from "axios"
import { useUser } from '../UserContext';


function EventAdd() {

  const { currentUser, isLoading, error } = useUser();
  // State variables for managing input values and error messages
  const [eventName, setEventName] = useState('');
  const [dateTime, setDateTime] = useState('');
  const [minutes, setMinutes] = useState(0);
  const [groupName, setGroupName] = useState('');
  const [groupid, setGroupid] = useState();

  // React hook to manage navigation between pages
  const navigate = useNavigate();

  const goToLogin = () => {
    navigate('/account/login');
  };

  const handleEventSubmit = async (e) => {
    e.preventDefault();

    const durationMinutes = parseInt(minutes);
    if (isNaN(durationMinutes) || durationMinutes > 1439 ||  durationMinutes < 1) {
      alert('The duration of the event must be less than or equal to 1439 and greater than 0');
      return;
    }

    try{
      const groupInvolvedRes = await axios.get(`http://localhost:5000/api/database/user-groups/${currentUser.userID}`);
      var listOfGroups = [];
      const n = (groupInvolvedRes.data).length;
      for (var i = 0; i < n; i++) {listOfGroups.push((groupInvolvedRes.data)[i].groupName);}

      if (!listOfGroups.includes(groupName)){
        alert("You can only add an event to a group you are in!");
        return;
      }

    } catch (error) {
        alert("Failed checking group authentication")
    }
    
    try{
      const groupRes = await axios.get(`http://localhost:5000/api/account/groups/${groupName}/id`);
      
      if (groupRes.data && groupRes.data.groupId){
        console.log('Group ID: ', groupRes.data.groupId);
        var groupid = groupRes.data.groupId;
      } else {
        alert('The group you mentioned does not exist, please try again.');
        return;
      }
    } catch (error) {
      console.error('Error fetching group: ', error);
      alert('Failed to get the group details.');
      return;
    }
    
    // Convert dateTime string to a Date object
    const eventDateTime = new Date(dateTime);

    // Create event object
    const event = {
      "eventname": eventName,
      "datetime": eventDateTime.toISOString(),
      "minutes": durationMinutes,
      "groupID": groupid
    };

    // Check if correct
    console.log(event);
    
    
    axios.post('http://localhost:5000/api/scheduling/', event)
    .then(response => {
      console.log('Event added to the database', response.data);
    })
    .catch(error => {
      console.error('Error adding event to the database', error);
    });

    navigate("/scheduling")
  }



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
                    <label htmlFor="duration" className="form-label">Duration (minutes)</label>
                    <input
                      type="text"
                      className="form-control"
                      id="duration"
                      onChange={(e) => { setMinutes(e.target.value) }}
                      placeholder="Enter duration (Must be at least one and less than 1440)"
                      required
                    />
                  </div>

                  <div className="mb-3">
                    <label className="text-danger">*</label>
                    <label htmlFor="groupName" className="form-label">Group Name</label>
                    <input
                      type="text"
                      className="form-control"
                      id="groupName"
                      onChange={(e) => { setGroupName(e.target.value) }}
                      placeholder="Enter group name"
                      required
                    />
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