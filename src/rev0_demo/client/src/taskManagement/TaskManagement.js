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
const infoIcon = require('../images/info-icon.png');

function TaskManagement() {
  // User State
  const [currentUser, setCurrentUser] = useState('');

  // Task State
  const [tasks,setTasks] = useState([]);
  const [displayTasks,setDisplayTasks] = useState([]);
  const [incompleteTasks, setIncompleteTasks] = useState([]);
  const [completeTasks, setCompleteTasks] = useState([]);

  // History State
  const [showHistory, setShowHistory] = useState(false);
  const [isHistoryActive, setIsHistoryActive] = useState(false);

  // Search State
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [showResults, setShowResults] = useState(false);

  // Modal State
  const [selectedTask, setSelectedTask] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const navigate = useNavigate();

  // Search handler
  const handleSearch = (e) => {
    const inputValue = e.target.value;
    setQuery(inputValue);
    const result = incompleteTasks.filter(task =>
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


  // Toggle showing History of all tasks
  const toggleShowHistory = () => {
    setShowHistory(!showHistory);
    setIsHistoryActive(!isHistoryActive);
  }

  // Go to individual Task Page
  const handleSelect = (task) => {
    navigate('tasks/task/'+String(task))
  }

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

  // Filter Between Incomplete and Completed Tasks
  useEffect(()=>{
    const incompleteList = displayTasks.filter(task => !task.completed);
    const completeList = displayTasks.filter(task => task.completed);
    setIncompleteTasks(incompleteList);
    setCompleteTasks(completeList);
  },[displayTasks])
  
  // Function to Sort By Deadline Date of Tasks
  const sortDate= (task1,task2) => {
    return new Date(task1.deadlineDate)- new Date(task2.deadlineDate);
  }

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
                      <h4>Due: {new Date(selectedTask.deadlineDate).toLocaleDateString()}</h4>
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
                      
                      <button type="button" className="btn btn-warning" onClick={() => handleEdit()}>
                        <img src={editIcon} alt="Edit Task" style={{ width: '28px', height: '28px' }} /> Edit
                      </button>
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
                    <h5 className="modal-title">Edit Task</h5>
                    <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                  </div>
                  <div className="modal-body">
                    <EditTask closeModal={closeModal} inputTask={{...selectedTask}}/>
                  </div>
                </div>
              </div>
            </div>

            {/* Modal for Info component */}
            <div className="modal fade" id="infoModal" tabIndex="-1" aria-labelledby="infoModalLabel" aria-hidden="true">
              <div className="modal-dialog">
                <div className="modal-content">
                  <div className="modal-header">
                    <h5 className="modal-title" id="infoModalLabel">Information</h5>
                    <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                  </div>
                  <div className="modal-body">
                    <ul>
                      <li><span style={{ backgroundColor: 'grey', color: 'white' }}>White Cards:</span> Upcoming due tasks</li>
                      <li><span style={{ backgroundColor: 'red', color: 'white' }}>Red Cards:</span> Overdue tasks</li>
                      <li><span style={{ backgroundColor: 'green', color: 'white' }}>Green Cards:</span> Completed tasks</li>
                    </ul>
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
                      <h5 className="mb-2">Due: {new Date(task.deadlineDate).toLocaleDateString()}</h5>
                      <h6 className="mb-2 text-muted">{task.groupID}</h6>
                      <p>{task.description}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="d-flex mb-3">
              <button type="button" className="btn btn-outline-primary btn-lg me-1 w-100" data-bs-toggle="modal" data-bs-target="#addTaskModal">
                ➕ Add Task
              </button>
              <button type="button" className={`btn btn-outline-info btn-lg me-1 w-100 ${isHistoryActive ? 'active' : ''}`} onClick={toggleShowHistory}>
                Task History
              </button>
              <button type="button" className="btn btn-outline-secondary border-0" data-bs-toggle="modal" data-bs-target="#infoModal">
                <img src={infoIcon} alt="Info" style={{ width: '28px', height: '28px' }} />
              </button>
            </div>
            
            {/* Display Incomplete Tasks */}
            {!showHistory && (
              <div className="row row-cols-1 row-cols-md-4 g-4 mb-3">
                {incompleteTasks.sort(sortDate).map((task) => {
                  var background = "card due-tasks h-100";
                  if (new Date(task.deadlineDate) < Date.now()) {
                    background = "card overdue-tasks h-100";
                  }
                  return (
                    <div className="col" key={task._id}>
                      <div className={background}>
                        <div className="card-header">
                          <h2 className="card-title">{task.taskName}</h2>
                          <h4 className="card-subtitle mb-2">Due: {new Date(task.deadlineDate).toLocaleDateString()}</h4>
                          <h6 className="card-subtitle mb-2 text-muted">{task.groupID}</h6>
                        </div>
                        <div className="card-body">
                          <p className="card-text" style={{ display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{task.description}</p>
                        </div>
                        <div className="card-footer">
                          <button className="btn btn-primary stretched-link w-100" onClick={() => handleOpen(task)}>Details</button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Task History */}
            {showHistory && (
              <div className="row row-cols-1 row-cols-md-4 g-4 mb-3">
              {completeTasks.sort(sortDate).map((task)=>{
                var background = "card done-tasks h-100";
                return(
                  <div className="col">
                    <div key={task._id} className={background}>
                      <div className="card-header">
                        <h2 className="card-title">{task.taskName}</h2>
                        <h4 className="card-subtitle mb-2">Due: {new Date(task.deadlineDate).toLocaleDateString()}</h4>
                        <h6 className="card-subtitle mb-2 text-muted">{task.groupID}</h6>
                      </div>
                      <div className="card-body">
                        <p className="card-text" style={{ display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{task.description}</p>
                      </div>
                      <div className="card-footer">
                        <button className="btn btn-primary stretched-link w-100" onClick ={() => handleOpen(task)}>Details</button>
                      </div>
                    </div>
                  </div>
                )
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
