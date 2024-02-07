import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';

function Task() {
  const [task,setTask] = useState([]);
  let {id} = useParams();
  const navigate = useNavigate();
  useEffect(() => {
    const fetchTaskData = async () => {
      try {
        const taskResponse = await axios.get(`http://localhost:5000/api/taskManagement/tasks/task/${id}`);
        if (!taskResponse.data){
          console.error("Task data not found");
          return;
        }
        const taskData = taskResponse.data;
        setTask(taskData);
        console.log(taskData);
      } catch (error) {
        console.error('Error fetching task data:', error);
      }
    }
    fetchTaskData();
  },[id]);

  const goToEdit = () => {
    navigate('edit');
  }

  const complete = () =>{
    setTask({...task,completed:true})
    // TODO add complete on backend
  }

  return (
    <div>
      <h1>Individual Task Page for {task.taskName}</h1>
      <h3>ID: {id}</h3>
      <h3>Group ID: {task.groupID}</h3>
      <h3>Start date: {new Date(task.createdDate).toLocaleDateString()}</h3>
      <h3>Deadline date: {new Date(task.deadlineDate).toLocaleDateString()}</h3>
      <h3>Completed: {task.completed?"Yes":"No"}</h3>
      {!task.completed && (<h3>Overdue: {(new Date(task.deadlineDate)<Date.now())?"Yes":"No"}</h3>)} 
      <p>Description: {task.description}</p>
      <div>
      <button onClick={goToEdit}>Edit Task</button>
      <button onClick={complete}>Complete</button>
      </div>
    </div>
  );
}

export default Task;