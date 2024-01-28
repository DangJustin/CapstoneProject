import React from 'react';
import { useNavigate } from 'react-router-dom';

const HomePage = () => {
  const navigate = useNavigate();

  const goToLogin = () => {
    navigate('/account/login');
  };
  const goToAccount = () => {
    navigate('/account');
  };

  const goToTaskManagement = () => {
    navigate('/taskManagement');
  };

  const goToScheduling = () => {
    navigate('/scheduling');
  };

  const goToBillManagement = () => {
    navigate('/billManagement');
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
