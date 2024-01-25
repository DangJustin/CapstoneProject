import React from 'react';
import { useNavigate } from 'react-router-dom';

const HomePage = () => {
  const navigate = useNavigate();

  const goToTaskManagement = () => {
    navigate('/page1');
  };

  const goToScheduling = () => {
    navigate('/page2');
  };

  const goToBillManagement = () => {
    navigate('/page3');
  };

  return (
    <div>
      <h2>Home Page</h2>
      
      {/* Use navigate to go to different pages */}
      <button onClick={goToTaskManagement}>Go to Task Management</button>
      <br />
      <button onClick={goToScheduling}>Go to Scheduling</button>
      <br />
      <button onClick={goToBillManagement}>Go to Bill Management</button>
    </div>
  );
};

export default HomePage;
