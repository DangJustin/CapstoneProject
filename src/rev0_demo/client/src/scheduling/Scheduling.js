import React from 'react';
import Layout from '../Layout';
import { useNavigate } from 'react-router-dom';


function Scheduling() {
  const navigate = useNavigate();
  
  
  // Go to event adding page
  const goToEventAddPage = () => {
    navigate('/scheduling/eventadd');
  }

  return (
    <Layout>
      <div>
        <h1>Scheduling Page</h1>
        <hr/>
        <button onClick={goToEventAddPage} style={{ position: 'relative', bottom: '7.5px', left: '5px' }}>
          ➕ 
        </button>
      </div>
    </Layout>
  );
}

export default Scheduling;
