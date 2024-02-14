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
  const [completeTasks, setCompleteTasks] = useState([]);
  const [incompleteTasks, setIncompleteTasks] = useState([]);
  const navigate = useNavigate();
  const goToAddTask = () => {
    navigate('addTask');
  };
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
          console.error('No user currently logged in.');
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
    const completeList = displayTasks.filter(task => task.completed);
    setCompleteTasks(completeList);
    setIncompleteTasks(incompleteList);
  },[displayTasks])

  return (
    <Layout>
      <div>
        {currentUser ? (
          <div>
            <h1>Task Management Page for user: {currentUser.email}</h1>
            <hr></hr>
          

            {/*Table to show all incomplete tasks*/}
            <h3>Incomplete Tasks</h3>
            <div>
            <table class="table table-bordered">
              <thead>
                  <tr>
                      <th>Task ID</th>
                      <th>Task Name</th>
                      <th>Task Description</th>
                      <th>Group Name</th>
                      <th>Date Created</th>
                      <th>Deadline Date</th>
                      <th>Overdue</th>
                      <th>Users Responsible</th>
                  </tr>
              </thead>
              <tbody>
                  {incompleteTasks.map((task) => {
                      return(
                          <tr key={task._id}>
                              <td>{task._id}</td>
                              <td>{task.taskName}</td>
                              <td>{task.description}</td>
                              <td>{task.groupID}</td>
                              <td>{new Date(task.createdDate).toLocaleDateString()}</td>
                              <td>{new Date(task.deadlineDate).toLocaleDateString()}</td>
                              <td>{(!task.completed&&(new Date(task.deadlineDate)<Date.now()))?"Yes":"No"}</td>
                              <td>{task.usersResponsible.join(", ")}</td>
                          </tr>
                      )
                  })}
              </tbody>
              </table>
            </div>

            {/*Table to show all completed tasks*/}
            <h3>Completed Tasks</h3>
            <div>
            <table class="table table-bordered">
              <thead>
                  <tr>
                      <th>Task ID</th>
                      <th>Task Name</th>
                      <th>Task Description</th>
                      <th>Group Name</th>
                      <th>Date Created</th>
                      <th>Deadline Date</th>
                      <th>Users Responsible</th>
                  </tr>
              </thead>
              <tbody>
                  {completeTasks.map((task) => {
                      return(
                          <tr key={task._id}>
                              <td>{task._id}</td>
                              <td>{task.taskName}</td>
                              <td>{task.description}</td>
                              <td>{task.groupID}</td>
                              <td>{new Date(task.createdDate).toLocaleDateString()}</td>
                              <td>{new Date(task.deadlineDate).toLocaleDateString()}</td>
                              <td>{task.usersResponsible.join(", ")}</td>
                          </tr>
                      )
                  })}
              </tbody>
              </table>
            </div>
            
            <div className="btn-toolbar mb-3">
            {/* Dropdown Menu to Select Task */}
              <button type="button" className="btn btn-primary me-1" onClick={goToAddTask}>Add Task</button>
              <div className ='dropdown' >
                <button className="btn btn-secondary dropdown-toggle"
                  type="button"
                  id="dropdownMenuButton"
                  data-bs-toggle="dropdown"
                  aria-haspopup="true"
                  aria-expanded="false"
                >
                {'Select a task'}
                </button>
                <div className="dropdown-menu" aria-labelledby="dropdownMenuButton">
                  {tasks.map((task) => (
                    <button
                      key={task._id}
                      className="dropdown-item"
                      onClick={() => handleSelect(task._id)}
                    >
                      {task.taskName}
                    </button>
                  ))}
                  </div>
              </div>
            </div>


          </div>
        ) : (
          <div>
            <h1>Task Management Page</h1>
            <p>No user currently logged in.</p>
          </div>
        )}
      </div>
    </Layout>
  );
}

export default TaskManagement;
