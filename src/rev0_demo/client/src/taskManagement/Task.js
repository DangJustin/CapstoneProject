import React, { useEffect, useState } from 'react';
import {useParams } from 'react-router-dom';
import axios from 'axios';
import Layout from '../Layout';

function Task() {
  const [task,setTask] = useState([]);
  const [form,setForm] = useState([]);
  const [edit,setEdit] = useState(false);
  let {id} = useParams();

  // Get task data
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


  // Show/Hide Edit form
  const turnOnEdit = () => {
    setEdit(!edit);
    setForm(task);
  }

  // Complete task
  const complete = async () =>{
    try {
      await axios.put(`http://localhost:5000/api/taskManagement/tasks/task/${id}/complete`);
      setTask({...task,completed:true})
    } catch (error){
      console.error('Error adding task: ', error)
    }
  }

  // Change fields in form
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setForm((prevForm) => ({
      ...prevForm,
      [name]: value,
    }));
  }

  // Change task to edited values
  const handleSubmit = async (e) => {
    e.preventDefault();
    setTask(form);
    await axios.put(`http://localhost:5000/api/taskManagement/tasks/task/${id}`,form);
    console.log('Updated Task:', form);
    turnOnEdit();
  };


  return (
    <Layout>
      <div>
        <h1>Individual Task Page for {task.taskName}</h1>
        <h3>ID: {id}</h3>
        <h3>Group ID: {task.groupID}</h3>
        <h3>Start date: {new Date(task.createdDate).toLocaleDateString()}</h3>
        <h3>Deadline date: {new Date(task.deadlineDate).toLocaleDateString()}</h3>
        <h3>Completed: {task.completed?"Yes":"No"}</h3>
        {!task.completed && (<h3>Overdue: {(new Date(task.deadlineDate)<Date.now())?"Yes":"No"}</h3>)} 
        <p>Description: {task.description}</p>
        {task.usersResponsible && (<h3>Users Responsible: {task.usersResponsible.join(', ')}</h3>)}
        <div>
        <button onClick={turnOnEdit}>Edit Task</button>
        {!task.completed && (<button onClick={complete}>Complete</button>)}
        </div>
        {edit && (<div>
          <h1>Edit task: {task.taskName}</h1>
          <form onSubmit={handleSubmit}>
          <label>
            ID:
            <input
              type="text"
              name="id"
              value={form._id}
              onChange={handleInputChange}
              readOnly
            />
          </label>
          <br />
          <label>
            Name:
            <input
              type="text"
              name="taskName"
              value={form.taskName}
              onChange={handleInputChange}
            />
          </label>
          <br />
          <label>
            Description:
            <textarea
              name="description"
              value={form.description}
              onChange={handleInputChange}
            />
          </label>
          <br />
          <label>
            Deadline Date: <input 
            type="date"
            name="deadlineDate"  
            value={form.deadlineDate}
            onChange={handleInputChange} 
            />
          </label>
          <br />
          <button type="submit">Save</button>
        </form>
        </div>)}
      </div>
    </Layout>
  );
}

export default Task;