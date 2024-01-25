import React from 'react';
import { useNavigate } from 'react-router-dom';

const HomePage = () => {
  const navigate = useNavigate();

  const goToLogin = () => {
    navigate('/page1');
  };
  const goToAccount = () => {
    navigate('/page2');
  };

  const goToTaskManagement = () => {
    navigate('/page3');
  };

  const goToScheduling = () => {
    navigate('/page4');
  };

  const goToBillManagement = () => {
    navigate('/page5');
  };

  return (
    <div>
      <h2>Home Page</h2>
      
      {/* Use navigate to go to different pages */}
      <button onClick={goToLogin}>Go to Login</button>
      <br />
      <button onClick={goToAccount}>Go to Account</button>
      <br />
      <button onClick={goToTaskManagement}>Go to Task Management</button>
      <br />
      <button onClick={goToScheduling}>Go to Scheduling</button>
      <br />
      <button onClick={goToBillManagement}>Go to Bill Management</button>
    </div>
  );
};

export default HomePage;
