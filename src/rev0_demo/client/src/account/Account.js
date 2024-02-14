import React from 'react';
import AuthDetails from "../AuthDetails"
import Layout from '../Layout';
import { auth } from "../firebase"
import { useNavigate } from "react-router-dom"
import { useUser } from '../UserContext';


function Account() {

  const navigate = useNavigate();
  const { currentUser, isLoading, error } = useUser();

  // If data is loading or there's an error, handle those cases
  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;

  const goToLogin = () => {
    navigate('/account/login');
  };

  const goToGroupPage = () => {
    navigate('/account/group');
  };

  const goToEditInfoPage = () => {
    navigate('/account/editinfo');
  };

  return (
    <Layout>
      <div>
        <h1>Account Page</h1>
        {!auth.currentUser && 
        <div>
          <h4>There is no user currently logged in</h4>
          <button onClick={goToLogin}>Click here to log in</button>
        </div>
        }

        {auth.currentUser && 
        <div>
<h4>Hi, {currentUser.firstname}!</h4>
          <hr></hr>
          <h5>Username:     {currentUser.username}</h5>
          <h5>Name:         {currentUser.firstname} {currentUser.lastname}</h5>
          <h5>Email:        {currentUser.email}</h5>
          <h5>Phone:        {currentUser.phone}</h5>
          <div>

        <button onClick={goToEditInfoPage}>Edit Info</button>
        </div>
        <div>
        <button onClick={goToGroupPage}>View Groups</button>
        </div>
        <div>
        <button>Delete</button>
        </div>
        </div>

        }



      </div>
      </Layout>
  );
}

export default Account;
