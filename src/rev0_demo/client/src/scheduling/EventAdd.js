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
      <div>
        <h1>Add an Event!</h1>
        {!auth.currentUser && (
          <div>
            <h2>Login first, you are not logged in!</h2>
            <button onClick={goToLogin}>Login</button>
          </div>
        )}

        {auth.currentUser && (
          <div>
            <form action="POST" onSubmit={handleEventSubmit}>
              <div>
                <input
                  type="text"
                  onChange={(e) => { setEventName(e.target.value) }}
                  placeholder="Enter Your Event Title"
                  required
                />
              </div>
              <p>What is taking place?</p>
              <div>
                <input
                  type="datetime-local"
                  onChange={(e) => { setDateTime(e.target.value) }}
                  placeholder="Start date and time?"
                  required
                />
              </div>
              <p>Enter start date and time of the event.</p>
              <div>
                <input
                  type="text"
                  onChange={(e) => { setMinutes(e.target.value) }}
                  placeholder="Duration? (minutes)"
                  required
                />
              </div>
              <p>Must be at least one and less than 1440.</p>
              <div>
                <input
                  type="text"
                  onChange={(e) => { setGroupName(e.target.value) }}
                  placeholder="Group name?"
                  required
                />
              </div>
              <p>Which Group is this for?</p>

              <input type="submit" value="Add Event" />
            </form>

          </div>
        )}
      </div>
    </Layout>
  );
}

export default EventAdd;