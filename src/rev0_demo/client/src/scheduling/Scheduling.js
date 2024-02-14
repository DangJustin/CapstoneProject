import React, { useEffect, useState } from 'react';
import Layout from '../Layout';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../UserContext';
import axios from "axios"

function Scheduling() {
  const navigate = useNavigate();


  // Go to event adding page
  const goToEventAddPage = () => {
    navigate('/scheduling/eventadd');
  }

  const { currentUser, isLoading, error } = useUser();

  const [events, setEvents] = useState([]);

  useEffect(() => {
    async function fetchEvents() {
      try {
        const userGroupsResponse = await axios.get(`http://localhost:5000/api/database/user-groups/${currentUser.userID}`);
        const groups = userGroupsResponse.data;

        const eventsPromises = groups.map(group =>
          axios.get(`http://localhost:5000/api/scheduling/group/${group._id}/events`)
        );

        const eventsResponses = await Promise.all(eventsPromises);
        const allEvents = eventsResponses.flatMap(response => response.data);
        console.log(allEvents)

        // Filter out past events
        const currentDateTime = new Date();
        const upcomingEvents = allEvents.filter(event => new Date(event.datetime) > currentDateTime);

        // Sort events by date and time
        upcomingEvents.sort((a, b) => new Date(a.datetime) - new Date(b.datetime))
        setEvents(upcomingEvents);
      } catch (error) {
        console.error('Error fetching events:', error);
      }
    }

    fetchEvents();
  }, []);



  return (
    <Layout>
      <div>
        <h1>Scheduling Page</h1>
        <hr />
        <button onClick={goToEventAddPage} style={{ position: 'relative', bottom: '7.5px', left: '5px' }}>
          ➕
        </button>
        {events.map(event => {
          const { date, startTime, endTime } = formatDateAndTime(event.datetime, event.minutes);
          return (
            <div key={event._id} >
              <h2>{event.eventname}</h2>
              <p>{date}</p>
              <p>{startTime} - {endTime} {nextDayOverflow(startTime, endTime) && "next day"}</p>
            </div>
          );
        })}

      </div>
    </Layout>
  );
}

function formatDateAndTime(startIsoString, durationMinutes) {
  const startDate = new Date(startIsoString);
  const endDate = new Date(new Date(startIsoString).getTime() + durationMinutes * 60000); // Add duration in milliseconds
  
  // Options for formatting the date part
  const dateOptions = { year: 'numeric', month: 'long', day: 'numeric' };
  // Options for formatting the time part
  const timeOptions = { hour: '2-digit', minute: '2-digit', hour12: true };

  return {
    date: startDate.toLocaleDateString('en-US', dateOptions),
    startTime: startDate.toLocaleTimeString('en-US', timeOptions).toLowerCase(),
    endTime: endDate.toLocaleTimeString('en-US', timeOptions).toLowerCase()
  };
}

function nextDayOverflow(starttime, endtime){
  if (starttime.slice(-2) > endtime.slice(-2)) {return true;}
  else if (starttime.slice(-2) < endtime.slice(-2)) {return false;}
  else if (starttime.substring(0,5) < endtime.substring(0,5)) {return false;}
  return true
}





export default Scheduling;
