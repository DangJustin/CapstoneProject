import React, { useEffect, useState }  from 'react';
import { useNavigate } from 'react-router-dom';


function TaskManagement() {
  const [user,setUser] = useState([]);
  const [tasks,setTasks] = useState([{_id:1, taskName:'task1', description:'This is a task', groupID:0, completed:false, createdDate:Date.now, deadlineDate:Date.now}, 
  {_id:2, taskName:'task2', description:'This is a 2nd task', groupID:0, completed:true, createdDate:Date.now, deadlineDate:Date.now}]);
  const navigate = useNavigate();
  const goToAddTask = () => {
    navigate('addTask');
  };
  const handleSelectChange = (event) =>{
    navigate('tasks/task/'+String(event.target.value));
  };
  useEffect(() => {},[]);
  return (
    <div>
      <h1>Task Management Page</h1>
      {/*Table to show all tasks*/}
      <div>
      <table border="1">
        <thead>
            <tr>
                <th>Task ID</th>
                <th>Task Name</th>
                <th>Task Description</th>
                <th>Group ID</th>
                <th>Completion Status</th>
                <th>Date Created</th>
                <th>Deadline Date</th>
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
                        <td>{String(task.completed)}</td>
                        <td>{Date(task.createdDate)}</td>
                        <td>{Date(task.deadlineDate)}</td>
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
