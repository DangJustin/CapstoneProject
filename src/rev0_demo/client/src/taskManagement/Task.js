import React, { useEffect, useState } from 'react';
import {useParams } from 'react-router-dom';
import axios from 'axios';
import Layout from '../Layout';
import { getGroupName, getUserNames } from '../utils/nameConversions';

function Task() {
  const [task,setTask] = useState([]);
  const [groupName,setGroupName] = useState('');
  const [users,setUsers] = useState([]);
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

    // Get group name and users
    useEffect(() => {
      const fetchTaskData = async () => {
        try {
          const group = await getGroupName(task.groupID);
          const users_task = await getUserNames(task.usersResponsible);
          setGroupName(group);
          setUsers(users_task);
        } catch (error) {
          console.error('Error fetching task data:', error);
        }
      }
      fetchTaskData();
    },[task]);


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
        {/* Display Task Info */}
        <h1>{task.taskName}</h1>
        <h5>ID: {id}</h5>
        <hr></hr>
        <h5>Group Name: {groupName}</h5>
        <h5>Description: {task.description}</h5>
        <h5>Start date: {new Date(task.createdDate).toLocaleDateString()}</h5>
        <h5>Deadline date: {new Date(task.deadlineDate).toLocaleDateString()}</h5>
        <h5>Completed: {task.completed?"Yes":"No"}</h5>
        {!task.completed && (<h5>Overdue: {(new Date(task.deadlineDate)<Date.now())?"Yes":"No"}</h5>)} 
        {users && (<h5>Users Responsible: {users.join(', ')}</h5>)}
        <div className="btn-toolbar">
        {!task.completed && (<button className="btn btn-primary me-1" onClick={complete}>Complete</button>)}
        <button className="btn btn-warning me-1" onClick={turnOnEdit}>Edit Task</button>
        </div>
        {/* Form to edit task */}
        {edit && (<div>
          <hr></hr>
          <h1>Edit Task: {task.taskName}</h1>
          <form onSubmit={handleSubmit}>
            <div className="mb-3 w-25">
                  <label className="form-label">Task Name:</label>
                  <input type="text" name="taskName"  className="form-control" value={form.taskName} onChange={handleInputChange} />
            </div>
            <div className="mb-3 w-25">
                  <label className="form-label">Description:</label>
                  <textarea name="description" className="form-control" rows="3" value={form.description} onChange={handleInputChange}
            />
            </div>
            <div className="mb-3 w-25">
                  <label className="form-label">Deadline Date:</label>
                  <input type="date" className="form-control" name="deadlineDate"  value={form.deadlineDate} onChange={handleInputChange} />
            </div>
            
            <div className='btn-toolbar mb-3'>
              <button className="btn btn-primary me-1" type="submit">Save</button>
              <button type="button" className="btn btn-danger" onClick={turnOnEdit}>Cancel</button>
            </div>
          </form>
        </div>)}
      </div>
    </Layout>
  );
}

export default Task;