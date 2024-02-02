import React from 'react';
import { useNavigate } from 'react-router-dom';


function TaskManagement() {
  const navigate = useNavigate();
  const goToTasks = () => {
    navigate('tasks');
  };
  const goToAddTask = () => {
    navigate('addTask');
  };
  return (
    <div>
      <h1>Task Management Page</h1>
      <button onClick={goToTasks}>View Tasks</button>
      <br />
      <button onClick={goToAddTask}>Add Task</button>
    </div>
  );
}

export default TaskManagement;
