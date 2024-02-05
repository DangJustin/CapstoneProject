import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';


function Tasks() {
  const [user,setUser] = useState([]);
  const [tasks,setTasks] = useState([{id:1, name:'task1', complete:'No'},{id:2, name:'task2',complete:'Yes'}]);
  const navigate = useNavigate();
 
  useEffect(() => {},[]);


  const handleSelectChange = (event) =>{
    navigate('task/'+String(event.target.value));
  };

  return (
    <div>
      <h1>Tasks Page</h1>
      
      {/*Table to show all tasks*/}
      <div>
      <table border="1">
        <thead>
            <tr>
                <th>Task ID</th>
                <th>Task Name</th>
                <th>Completion Status</th>
            </tr>
        </thead>
        <tbody>
            {tasks.map((task) => {
                return(
                    <tr key={task.id}>
                        <td>{task.id}</td>
                        <td>{task.name}</td>
                        <td>{task.complete}</td>
                    </tr>
                )
            })}
        </tbody>
        </table>
      </div>

      {/*Dropdown menu to select task*/}
      <div>
      <select value={""} onChange={handleSelectChange}>
        <option value="">Select a task</option>
        {tasks.map(task => (
          <option key={task.id} value={task.id}>{task.name}</option>
        ))}
      </select>
      </div>
    </div>
  );
}

export default Tasks;