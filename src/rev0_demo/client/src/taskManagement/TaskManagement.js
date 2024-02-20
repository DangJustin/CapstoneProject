import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import axios from 'axios';
import { getGroupName, getUserNames } from '../utils/nameConversions';
import Layout from '../Layout';

const auth = getAuth();

function TaskManagement() {
  const [currentUser, setCurrentUser] = useState('');
  const [tasks,setTasks] = useState([]);
  const [displayTasks,setDisplayTasks] = useState([]);
  const [incompleteTasks, setIncompleteTasks] = useState([]);
  const [showHistory, setShowHistory] = useState(false);
  const navigate = useNavigate();

  // Go to add task page
  const goToAddTask = () => {
    navigate('addTask');
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
        console.log(tasksData);
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
    setIncompleteTasks(incompleteList);
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

            {/* Display Incomplete Tasks */}
            <div className = "card-deck" style={{ display: "flex", flexWrap: "wrap" }}>
            {incompleteTasks.sort(sortDate).map((task)=>{
              var background = "card me-3 mb-3 bg-light";
              if ((new Date(task.deadlineDate)<Date.now())){
                background = "card me-3 mb-3 bg-danger";
              } 
              return(
                <div key={task._id} onClick={() => handleSelect(task._id)}  className={background}>
                  <div className="card-body">
                    <h2 className="card-title">{task.taskName}</h2>
                    <h4 class="card-subtitle mb-2">Due: {new Date(task.deadlineDate).toLocaleDateString()}</h4>
                    <h6 class="card-subtitle mb-2 text-muted">{task.groupID}</h6>
                    <p className="card-text">{task.description}</p>
                  </div>
                </div>
              )
            })}
            </div>

            
            <div className="btn-toolbar d-flex justify-content-center pt- mb-3">
              <button type="button" className="btn btn-primary btn-lg me-1" onClick={goToAddTask}>Add Task</button>
              <button type="button" className="btn btn-secondary btn-lg me-1" onClick={toggleShowHistory}>Task History</button>
            </div>

            {/* Task History */}
            {showHistory && <div>
              <h2>Task History</h2>
              <div className = "card-deck">
                {displayTasks.sort(sortDate).map((task)=>{
                  var background = "card me-3 mb-3 bg-light";
                  if (task.completed){
                    background = "card me-3 mb-3 bg-success";
                  }
                  else if ((new Date(task.deadlineDate)<Date.now())){
                    background = "card me-3 mb-3 bg-danger";
                  } 
                  return(
                    <div key={task._id} onClick={() => handleSelect(task._id)}  className={background}>
                      <div className="card-body">
                        <h2 className="card-title">{task.taskName}</h2>
                        <h4 class="card-subtitle mb-2">Due: {new Date(task.deadlineDate).toLocaleDateString()}</h4>
                        <h6 class="card-subtitle mb-2 text-muted">{task.groupID}</h6>
                        <p className="card-text">{task.description}</p>
                      </div>
                    </div>
                  )
                })}
                </div>
              </div>}


          </div>
        ) : (
          <div>
            <h1 className="text-center pt-3">Task Management Page</h1>
            <p>No user currently logged in.</p>
          </div>
        )}
      </div>
    </Layout>
  );
}

export default TaskManagement;
