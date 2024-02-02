import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';


function Task() {
  const [user,setUser] = useState([]);
  let {id} = useParams();
  const navigate = useNavigate();
  useEffect(() => {},[]);
  return (
    <div>
      <h1>Individual Task Page</h1>
      <h3>ID: {id}</h3>
    </div>
  );
}

export default Task;