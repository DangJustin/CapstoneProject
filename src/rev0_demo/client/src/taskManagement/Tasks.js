import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';


function Tasks() {
  const [user,setUser] = useState([]);
  const navigate = useNavigate();
  const goToTask = (id) => {
    navigate('task/'+id);
  };
  useEffect(() => {},[]);
  return (
    <div>
      <h1>Tasks Page</h1>
      <button onClick={() => goToTask(30)}>Test task</button>
    </div>
  );
}

export default Tasks;