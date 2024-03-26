import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import axios from 'axios';
import { getGroupName, getUserNames } from '../utils/nameConversions';
import Layout from '../Layout';
import AddTask from './AddTask';
import EditTask from './EditTask';
import Modal from 'bootstrap/js/dist/modal';

const auth = getAuth();
const editIcon = require('../images/edit-icon.png');
const completeIcon = require('../images/complete-icon.png');
const reopenIcon = require('../images/reopen-icon.png');

function TaskManagement() {
  // User State
  const [currentUser, setCurrentUser] = useState('');

  // Task State
  const [tasks,setTasks] = useState([]);
  const [displayTasks,setDisplayTasks] = useState([]);
  const [incompleteTasks, setIncompleteTasks] = useState([]);
  const [completeTasks, setCompleteTasks] = useState([]);
  const [overdueTasks, setOverdueTasks] = useState([]);

  // Search State
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [showResults, setShowResults] = useState(false);

  // Modal State
  const [selectedTask, setSelectedTask] = useState(null);
  const [showModal, setShowModal] = useState(false);

  const [expanded, setExpanded] = useState(false);
  const [expandedOverdue, setExpandedOverdue] = useState(false);
  const [expandedDue, setExpandedDue] = useState(false);
  const [expandedCompleted, setExpandedCompleted] = useState(false);
  const [numCols, setNumCols] = useState(1);

  // Search handler
  const handleSearch = (e) => {
    const inputValue = e.target.value;
    setQuery(inputValue);
    const searchList = [...overdueTasks, ...incompleteTasks];
    const result = searchList.filter(task =>
      task.taskName.toLowerCase().includes(inputValue.toLowerCase())
    );
    setResults(result);
    setShowResults(true);
  };

  // Completion Handler
  const toggleCompletion = async () => {
    try {
      if (!selectedTask.completed){
        await axios.put(`http://localhost:5000/api/taskManagement/tasks/task/${selectedTask._id}/complete`);
      } else{
        await axios.put(`http://localhost:5000/api/taskManagement/tasks/task/${selectedTask._id}/reopen`);
      }
      const modifiedTasks = [...displayTasks];
      for (let i = 0; i < displayTasks.length; i++){
        if ((selectedTask._id)===(displayTasks[i]._id)){
          modifiedTasks[i] = {...modifiedTasks[i],completed:!modifiedTasks[i].completed};
        }
      }
      setDisplayTasks(modifiedTasks);
    } catch (error){
      console.log(error);
    }
  }

  // Modal State Handlers
  const handleClose = () => {
    setQuery('');
    setShowResults(false);
    setSelectedTask(null);
  }

   // Go to individual Task Page
   const handleEdit = (task) => {
    setShowModal(false);
    const myModal  = document.getElementById('editTaskModal');
    const modal = new Modal(myModal);
    modal.show();
    setShowResults(false);
  }

  const handleOpen = (task) => {
    // console.log(task);
    setSelectedTask(task);
  }

  const handleDocumentClick = (event) => {
    if (!event.target.closest('.form-control') && !event.target.closest('.list-group')) {
      setShowResults(false);
    }
  };

  const toggleResults = () => {
    setShowResults(!showResults);
  };

  // Add event listener to handle clicks outside of the search input and results
  React.useEffect(() => {
    document.addEventListener('click', handleDocumentClick);

    return () => {
      document.removeEventListener('click', handleDocumentClick);
    };
  }, []);

  useEffect(() => {
    if (selectedTask) {
        const myModal = document.getElementById('taskDetailsModal');
        const modal = new Modal(myModal);
        modal.show();
    }
  }, [selectedTask]);

  //Close Modal handler for add task
  const closeModal = () => {
    setShowModal(false);
    window.location.reload();
  };

  //Checking if user is logged in
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
    });
    return () => unsubscribe();
  }, []);

  // Grab User tasks 
  useEffect(() => {
    const fetchTasksData = async () => {
      try {
        if (!currentUser) {
          return;
        }

        const tasksResponse = await axios.get(`http://localhost:5000/api/taskManagement/tasks/user/${currentUser.uid}`);

        if (!tasksResponse) {
          console.error('Failed to fetch task data for user');
          return;
        }

        const tasksData = tasksResponse.data;

        setTasks(tasksData);
        // console.log(tasksData);
      } catch (error) {
        console.error('Error fetching tasks data:', error);
      }
    };
    
    fetchTasksData();
  }, [currentUser]);

  // Update display with group names and user names
  useEffect(()=>{
    const changeTaskData = async() =>{
      const modifiedTasks = [...tasks];
      for (let i = 0; i < tasks.length; i++){
        modifiedTasks[i] = {
          ...modifiedTasks[i],
          groupID: await getGroupName(modifiedTasks[i].groupID),
          usersResponsible: await getUserNames(modifiedTasks[i].usersResponsible)
        }
      }
      setDisplayTasks(modifiedTasks);
    }
    changeTaskData();
  },[tasks])

  // Filter Between Incomplete, Completed and Overdue Tasks
  useEffect(() => {
    const now = new Date();
    
    const incompleteList = displayTasks.filter(task => !task.completed && new Date(task.deadlineDate) >= now);
    const completeList = displayTasks.filter(task => task.completed);
    const overdueList = displayTasks.filter(task => !task.completed && new Date(task.deadlineDate) < now);
  
    setIncompleteTasks(incompleteList);
    setCompleteTasks(completeList);
    setOverdueTasks(overdueList);
  }, [displayTasks]);
  
  // Function to Sort By Deadline Date of Tasks
  const sortDate= (task1,task2) => {
    return new Date(task1.deadlineDate)- new Date(task2.deadlineDate);
  }

  // Display Date Properly
  const displayDate = (dateString) => {
    var date = new Date(dateString);
    return new Date(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()).toDateString();
  }

  function toggleExpand(value) {
    setExpanded(!expanded);
    if(value == 1) setExpandedOverdue(!expandedOverdue);
    else if(value == 2) setExpandedDue(!expandedDue);
    else setExpandedCompleted(!expandedCompleted);
  }

  useEffect(() => {
    const handleResize = () => {
      const screenWidth = window.innerWidth;
      if (screenWidth >= 1280) {
        setNumCols(4);
      } else if (screenWidth >= 1000) {
        setNumCols(3);
      } else if (screenWidth >= 768) {
        setNumCols(2);
      } else {
        setNumCols(1);
      }
    };

    window.addEventListener('resize', handleResize);

    // Initial call to set the initial number of columns
    handleResize();

    // Cleanup function to remove event listener
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <Layout>
      <div>
        {currentUser ? (
          <div>
            <h1 className="text-center text-white pt-3">Tasks</h1>
            <hr></hr>

            {/* Modal to Display individual task data */}
            {selectedTask && (
              <div className="modal fade" id="taskDetailsModal" data-bs-backdrop="static" data-bs-keyboard="false" tabIndex="-1" role="dialog">
                <div className="modal-dialog modal-dialog-centered" role="document">
                  <div className="modal-content">
                    <div className="modal-header">
                      <h1 className="modal-title" >{selectedTask.taskName}</h1>
                      <button type="button" className="btn-close" data-bs-dismiss="modal" onClick={handleClose} aria-label="Close"></button>
                    </div>
                    <div className="modal-body">
                      <h4>Due: {displayDate(selectedTask.deadlineDate)}</h4>
                      <h4 className='text-muted'>{selectedTask.groupID}</h4>
                      <h4>Users Responsible: {selectedTask.usersResponsible.join(', ')}</h4>
                      <hr></hr>
                      <p>{selectedTask.description}</p>
                    </div>
                    <div className="modal-footer">
                      {!selectedTask.completed ? (
                        <button type="button" className="btn btn-success" data-bs-dismiss="modal" onClick={()=>{toggleCompletion();handleClose();}}>
                          <img src={completeIcon} alt="Complete Task" style={{ width: '28px', height: '28px' }} /> Complete
                        </button>
                      ) : (
                        <button type="button" className="btn btn-danger" data-bs-dismiss="modal" onClick={()=>{toggleCompletion();handleClose();}}>
                          <img src={reopenIcon} alt="Restore Task" style={{ width: '28px', height: '28px' }} /> Restore
                        </button>
                      )}
                      
                      {!expandedCompleted &&
                      <button type="button" className="btn btn-warning" onClick={() => handleEdit()}>
                        <img src={editIcon} alt="Edit Task" style={{ width: '28px', height: '28px' }} /> Edit
                      </button>
                      }
                    </div>
                  </div>
                </div>
              </div>            
            )}

            {/* Modal for AddTask component */}
            <div className="modal fade" id="addTaskModal" tabIndex="-1" role="dialog">
              <div className="modal-dialog modal-dialog-centered modal-lg" role="document">
                <div className="modal-content">
                  <div className="modal-header">
                    <h5 className="modal-title exo-bold">Add New Task</h5>
                    <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                  </div>
                  <div className="modal-body">
                    {/* Render the AddTask component */}
                    <AddTask closeModal={closeModal}/>
                  </div>
                </div>
              </div>
            </div>

            {/* Modal for EditTask component */}
            <div className="modal fade" id="editTaskModal" data-bs-backdrop="static" data-bs-keyboard="false" tabIndex="-1" role="dialog">
              <div className="modal-dialog modal-dialog-centered modal-lg" role="document">
                <div className="modal-content">
                  <div className="modal-header">
                    <h5 className="modal-title exo-bold">Edit Task</h5>
                    <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                  </div>
                  <div className="modal-body">
                    <EditTask closeModal={closeModal} inputTask={{...selectedTask}}/>
                  </div>
                </div>
              </div>
            </div>

            {/* Search Bar to search for tasks */}
            <div className="mb-3">
              <input
                type="search"
                className="form-control"
                placeholder="Search for Task"
                value={query}
                onChange={handleSearch}
                onClick={toggleResults}
              />
              {showResults && (
                <div className="list-group">
                  {results.map((task) => (
                    <div
                      key={task._id}
                      className="list-group-item list-group-item-action"
                      onClick={() => handleOpen(task)}
                    >
                      <h4 className="mb-2">{task.taskName}</h4>
                      <h5 className="mb-2">Due: {displayDate(task.deadlineDate)}</h5>
                      <h6 className="mb-2 text-muted">{task.groupID}</h6>
                      <p>{task.description}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="d-flex mb-3">
              <button type="button" className="btn btn-outline-primary btn-lg w-100" data-bs-toggle="modal" data-bs-target="#addTaskModal">
                <i className="bi bi-plus-circle"></i> Add Task
              </button>
            </div>

            {/* 3 task cards - Overdue, due and completed */}
            <div className={`d-flex flex-fill mb-3 task-card-row ${expanded ? 'child-expanded' : ''}`}>
              <div className={`card bg-white task-card hvr-sweep-to-right ${expandedOverdue ? 'expanded expand-left' : 'me-2'}`} style={{ cursor: 'pointer' }} onClick={() => toggleExpand(1)}>
                <div className="content collapse-content">
                  <div className="card-header">
                    <h5 className="card-title text-danger">Overdue Tasks</h5>
                  </div>
                  <div className="card-body fs-1">
                    <p className="card-text text-danger">{overdueTasks.length}</p>
                  </div>
                </div>
                <div className="card-body content expand-content">Overdue Tasks</div>
              </div>
              <div className={`card bg-primary bg-white task-card hvr-shutter-out-horizontal ${expandedDue ? 'expanded expand-both' : 'mx-2'}`} style={{ cursor: 'pointer' }} onClick={() => toggleExpand(2)}>
                <div className="content collapse-content">
                  <div className="card-header">
                    <h5 className="card-title text-primary">Due Tasks</h5>
                  </div>
                  <div className="card-body fs-1">
                    <p className="card-text text-primary">{incompleteTasks.length}</p>
                  </div>
                </div>
                <div className="card-body content expand-content">Due Tasks</div>
              </div>
              <div className={`card bg-white task-card hvr-sweep-to-left ${expandedCompleted ? 'expanded expand-right' : 'ms-2'}`} style={{ cursor: 'pointer' }} onClick={() => toggleExpand(3)}>
                <div className="content collapse-content">
                  <div className="card-header">
                    <h5 className="card-title text-success">Completed Tasks</h5>
                  </div>
                  <div className="card-body fs-1">
                    <p className="card-text text-success">{completeTasks.length}</p>
                  </div>
                </div>
                <div className="card-body content expand-content task-wrap">Completed Tasks</div>
              </div>
            </div>

            {/* Display Overdue Tasks */}
            {expandedOverdue && (
              <div className={`row row-cols-1 row-cols-md-${numCols} g-4 mb-3`}>
                {overdueTasks.sort(sortDate).map((task) => {
                  var background = "card overdue-tasks h-100";
                  return (
                    <div className="col" key={task._id}>
                      <div className={background}>
                        <div className="card-header">
                          <h2 className="card-title">{task.taskName}</h2>
                          <h4 className="card-subtitle mb-2">Due: {displayDate(task.deadlineDate)}</h4>
                          <h6 className="card-subtitle mb-2 text-mute">{task.groupID}</h6>
                        </div>
                        <div className="card-body">
                          <p className="card-text" style={{ display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{task.description}</p>
                        </div>
                        <div className="card-footer">
                          <button className="btn details-button stretched-link w-100" onClick={() => handleOpen(task)}><i className="bi bi-chevron-expand"></i> Details</button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
            
            {/* Display Due Tasks */}
            {expandedDue && (
              <div className={`row row-cols-1 row-cols-md-${numCols} g-4 mb-3`}>
                {incompleteTasks.sort(sortDate).map((task) => {
                  var background = "card due-tasks h-100";
                  return (
                    <div className="col" key={task._id}>
                      <div className={background}>
                        <div className="card-header">
                          <h2 className="card-title">{task.taskName}</h2>
                          <h4 className="card-subtitle mb-2">Due: {displayDate(task.deadlineDate)}</h4>
                          <h6 className="card-subtitle mb-2 text-muted">{task.groupID}</h6>
                        </div>
                        <div className="card-body">
                          <p className="card-text" style={{ display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{task.description}</p>
                        </div>
                        <div className="card-footer">
                          <button className="btn btn-primary stretched-link w-100" onClick={() => handleOpen(task)}><i className="bi bi-chevron-expand"></i> Details</button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Display Completed Tasks */}
            {expandedCompleted && (
              <div className={`row row-cols-1 row-cols-md-${numCols} g-4 mb-3`}>
                {completeTasks.sort(sortDate).map((task) => {
                  var background = "card done-tasks h-100";
                  return (
                    <div className="col" key={task._id}>
                      <div className={background}>
                        <div className="card-header">
                          <h2 className="card-title">{task.taskName}</h2>
                          <h4 className="card-subtitle mb-2">Due: {displayDate(task.deadlineDate)}</h4>
                          <h6 className="card-subtitle mb-2 text-muted">{task.groupID}</h6>
                        </div>
                        <div className="card-body">
                          <p className="card-text" style={{ display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{task.description}</p>
                        </div>
                        <div className="card-footer">
                          <button className="btn btn-success stretched-link w-100" onClick={() => handleOpen(task)}><i className="bi bi-chevron-expand"></i> Details</button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

          </div>
        ) : (
          <div>
            <h1 className="text-center text-white pt-3">Tasks</h1>
            <p className='text-white'>No user currently logged in.</p>
          </div>
        )}
      </div>
    </Layout>
  );
}

export default TaskManagement;
