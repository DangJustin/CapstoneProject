import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';


function ViewBill() {
  const [user,setUser] = useState([]);
  let {id} = useParams();
  const navigate = useNavigate();
  useEffect(() => {},[]);
  return (
    <div>
      <h1>View Expenses Page</h1>
    </div>
  );
}

export default ViewBill;