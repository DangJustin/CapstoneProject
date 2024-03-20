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
          console.log("modified");
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

  //Close Modal handler for add task
  const closeModal = () => {
    setShowModal(false);
    window.location.reload();
  };


  // Toggle showing History of all tasks
  const toggleShowHistory = () => {
    setShowHistory(!showHistory);
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
            <h1 className="text-center pt-3">Tasks</h1>
            <hr></hr>

            {/* Modal to Display individual task data */}
            {selectedTask && (
              <div className="modal fade show" style={{ display: 'block' }} tabindex="-1" role="dialog">
                <div className="modal-dialog modal-dialog-centered" role="document">
                  <div className="modal-content">
                    <div className="modal-header">
                      <h1 className="modal-title" >{selectedTask.taskName}</h1>
                      <button type="button" className="btn-close" onClick={handleClose} aria-label="Close"></button>
                    </div>
                    <div className="modal-body">
                      <h4>Due: {new Date(selectedTask.deadlineDate).toLocaleDateString()}</h4>
                      <h4 className='text-muted'>{selectedTask.groupID}</h4>
                      <h4>Users Responsible: {selectedTask.usersResponsible.join(', ')}</h4>
                      <hr></hr>
                      <p>{selectedTask.description}</p>
                    </div>
                    <div className="modal-footer">
                      {!selectedTask.completed?(<button type="button" className="btn btn-success" onClick={()=>{toggleCompletion();handleClose();}}>Complete Task</button>)
                      :(<button type="button" className="btn btn-danger" onClick={()=>{toggleCompletion();handleClose();}}>Reopen task</button>)}
                      {/* <button type="button" className="btn btn-warning" onClick={() => handleSelect(selectedTask._id)}>Edit Task</button> */}
                      <button type="button" className="btn btn-warning" onClick={() => handleEdit()}>Edit Task</button>
                    </div>
                  </div>
                </div>
              </div>            
            )}

            {/* Modal for AddTask component */}
            <div className="modal fade" id="addTaskModal" tabIndex="-1" role="dialog">
              <div className="modal-dialog modal-dialog-centered modal-xl" role="document">
                <div className="modal-content">
                  <div className="modal-header">
                    <h5 className="modal-title">Add New Task</h5>
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
            <div className="modal fade" id="editTaskModal" tabIndex="-1" role="dialog">
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

            {/* Search Bar to search for tasks */}
            <div className ="mb-3">
            <input type="search" className="form-control" placeholder="Search for Task" value={query} onChange={handleSearch}/>
            {showResults && (
              <div className="list-group">
                {results.map(task => (
                  <div key={task._id} className="list-group-item list-group-item-action" onClick={()=>handleOpen(task)}>
                    <h4 className='mb-2'>{task.taskName}</h4>
                    <h5 className="mb-2">Due: {new Date(task.deadlineDate).toLocaleDateString()}</h5>
                    <h6 className="mb-2 text-muted">{task.groupID}</h6>
                    <p>{task.description}</p>
                  </div>
                ))}
              </div>
            )}
            </div>

            <div className="d-grid mb-3">
              <button type="button" className="btn btn-outline-primary btn-lg me-1" data-bs-toggle="modal" data-bs-target="#addTaskModal">
              ➕ Add Task
              </button>
            </div>

            {/* Display Incomplete Tasks */}
            <div className="row row-cols-1 row-cols-md-4 g-4 mb-3">
            {incompleteTasks.sort(sortDate).map((task)=>{
              var background = "card bg-light h-100";
              if ((new Date(task.deadlineDate)<Date.now())){
                background = "card bg-danger h-100";
              } 
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

            <div className="d-grid mb-3">
              <button type="button" className="btn btn-outline-info btn-lg me-1" onClick={toggleShowHistory}>Task History</button>
            </div>
            

            {/* Task History */}
            {showHistory && (
              <div className="row row-cols-1 row-cols-md-4 g-4 mb-3">
              {completeTasks.sort(sortDate).map((task)=>{
                var background = "card bg-success h-100";
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
            <h1 className="text-center pt-3">Tasks</h1>
            <p>No user currently logged in.</p>
          </div>
        )}
      </div>
    </Layout>
  );
}

export default TaskManagement;
