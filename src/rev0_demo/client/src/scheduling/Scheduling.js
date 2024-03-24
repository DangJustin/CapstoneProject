import React, { useEffect, useState } from 'react';
import Layout from '../Layout';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../UserContext';
import axios from 'axios';
import Calendar from 'react-calendar';
import Modal from 'bootstrap/js/dist/modal';
import EventAdd from './EventAdd';
import 'react-calendar/dist/Calendar.css';
import './customCalendar.css';

function Scheduling() {
  const navigate = useNavigate();
  const { currentUser } = useUser();
  const [events, setEvents] = useState([]);
  const [showCalendar, setShowCalendar] = useState(false);
  const [showModal, setShowModal] = useState(false);

  const toggleView = () => {
    setShowCalendar(!showCalendar);
  };

  const closeModal = () => {
    setShowModal(false);
    window.location.reload();
  };

  useEffect(() => {
    if (currentUser && currentUser.userID) {
      async function fetchEvents() {
        try {
          const userGroupsResponse = await axios.get(`http://localhost:5000/api/database/user-groups/${currentUser.userID}`);
          const groups = userGroupsResponse.data;

          const eventsPromises = groups.map(group =>
            axios.get(`http://localhost:5000/api/scheduling/group/${group._id}/events`)
          );

          const eventsResponses = await Promise.all(eventsPromises);
          const allEvents = eventsResponses.flatMap(response => response.data);

          const currentDateTime = new Date();
          const upcomingEvents = allEvents.filter(event => new Date(event.enddatetime) > currentDateTime);
          upcomingEvents.sort((a, b) => new Date(a.datetime) - new Date(b.datetime));
          setEvents(upcomingEvents);
        } catch (error) {
          console.error('Error fetching events:', error);
        }
      }

      fetchEvents();
    }
  }, [currentUser]);

  // Format start and end times of events
  function formatDateAndTime(startIsoString, endIsoString) {
    const startDate = new Date(startIsoString);
    const endDate = new Date(endIsoString);
    const dateOptions = { year: 'numeric', month: 'long', day: 'numeric' };
    const timeOptions = { hour: '2-digit', minute: '2-digit', hour12: true };
    return {
      date: startDate.toLocaleDateString('en-US', dateOptions),
      startTime: startDate.toLocaleTimeString('en-US', timeOptions).toLowerCase(),
      endTime: endDate.toLocaleTimeString('en-US', timeOptions).toLowerCase()
    };
  }

  // Determine if an event spans into the next day
  function nextDayOverflow(startTime, endTime) {
    const format = time => time.split(':').map(num => parseInt(num, 10));
    const [startHour, startMinutes] = format(startTime);
    const [endHour, endMinutes] = format(endTime);
    return endHour < startHour || (endHour === startHour && endMinutes < startMinutes);
  }

  const getEventsForDate = (date) => {
    return events.filter(event => {
      const eventDate = new Date(event.datetime).toDateString();
      return new Date(date).toDateString() === eventDate;
    });
  };

  const tileContent = ({ date, view }) => {
    const dayEvents = view === 'month' && getEventsForDate(date);
    return (
      <div className="events-tile">
        {dayEvents.map(event => (
          <div key={event._id} className="event">
            <div className="event-name">{event.eventname}</div>
            <div className="event-time">{formatEventTime(event.datetime, event.enddatetime)}</div>
          </div>
        ))}
      </div>
    );
  };
  const formatEventTime = (startIsoString, endIsoString) => {
    const startTime = new Date(startIsoString);
    const endTime = new Date(endIsoString);
    const timeOptions = { hour: 'numeric', minute: '2-digit', hour12: true, hourCycle: 'h11' };
    return `${startTime.toLocaleTimeString('en-US', timeOptions)} - ${endTime.toLocaleTimeString('en-US', timeOptions)}`;
  };
  

  return (
    <Layout>
      <div className="container">
        <h1 className="text-center pt-3">Scheduling Page</h1>
        <hr />
        <div className="mb-3 d-flex justify-content-between">
          <button type="button" className="btn btn-primary" data-bs-toggle="modal" data-bs-target="#addEventModal">
            <i className="bi bi-plus-circle"></i> Add Event
          </button>
          <button className="btn btn-secondary" onClick={toggleView}>
            {showCalendar ? 'List View' : 'Calendar View'}
          </button>
        </div>

        {/* Modal for EventAdd component */}
        <div className="modal fade" id="addEventModal" tabIndex="-1" role="dialog">
              <div className="modal-dialog modal-dialog-centered modal-lg" role="document">
                <div className="modal-content">
                  <div className="modal-header">
                    <h5 className="modal-title exo-bold">Add New Event</h5>
                    <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                  </div>
                  <div className="modal-body">
                    {/* Render the AddTask component */}
                    <EventAdd closeModal={closeModal}/>
                  </div>
                </div>
              </div>
            </div>

        {showCalendar ? (
          <div className="calendar-container">
          <Calendar
            tileContent={tileContent}
          />
        </div>

        ) : (
          events.map(event => {
            const { date, startTime, endTime } = formatDateAndTime(event.datetime, event.enddatetime);
            return (
              <div key={event._id} className="card mb-3">
                <div className="card-body">
                  <h2 className="card-title">{event.eventname}</h2>
                  <p className="card-text">{date}</p>
                  <p className="card-text">{startTime} - {endTime} {nextDayOverflow(startTime, endTime) && "(next day)"}</p>
                </div>
              </div>
            );
          })
        )}
      </div>
    </Layout>
  );
}

export default Scheduling;
