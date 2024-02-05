import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';


function AddTask() {
  const [user,setUser] = useState([]);
  const navigate = useNavigate();
  useEffect(() => {},[]);
  return (
    <div>
      <h1>Add Task Page</h1>
    </div>
  );
}

export default AddTask;