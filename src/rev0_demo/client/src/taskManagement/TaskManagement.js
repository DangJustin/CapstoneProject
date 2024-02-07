import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import axios from 'axios';

const auth = getAuth();

function TaskManagement() {
  const [currentUser, setCurrentUser] = useState('');
  const [tasks,setTasks] = useState([]);
  const navigate = useNavigate();
  const goToAddTask = () => {
    navigate('addTask');
  };
  const handleSelectChange = (event) =>{
    navigate('tasks/task/'+String(event.target.value));
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
  return (
    <div>
      <h1>Task Management Page for user: {currentUser.email}</h1>
      
      {/*Table to show all tasks*/}
      <div>
      <table border="1">
        <thead>
            <tr>
                <th>Task ID</th>
                <th>Task Name</th>
                <th>Task Description</th>
                <th>Group ID</th>
                <th>Completed</th>
                <th>Date Created</th>
                <th>Deadline Date</th>
                <th>Overdue</th>
            </tr>
        </thead>
        <tbody>
            {tasks.map((task) => {
                return(
                    <tr key={task._id}>
                        <td>{task._id}</td>
                        <td>{task.taskName}</td>
                        <td>{task.description}</td>
                        <td>{task.groupID}</td>
                        <td>{task.completed?"Yes":"No"}</td>
                        <td>{new Date(task.createdDate).toLocaleDateString()}</td>
                        <td>{new Date(task.deadlineDate).toLocaleDateString()}</td>
                        <td>{(!task.completed&&(new Date(task.deadlineDate)<Date.now()))?"Yes":"No"}</td>
                    </tr>
                )
            })}
        </tbody>
        </table>
      </div>

      <div>
        <select value={""} onChange={handleSelectChange}>
          <option value="">Select a task</option>
          {tasks.map(task => (
            <option key={task._id} value={task._id}>{task.taskName}</option>
          ))}
        </select>
      </div>

      <button onClick={goToAddTask}>Add Task</button>
    </div>
  );
}

export default TaskManagement;
