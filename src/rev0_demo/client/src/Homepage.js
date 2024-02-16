import React from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from './Layout';

const taskImg = require('./images/tasks.png');
const scheduleImg = require('./images/schedules.png');
const billImg = require('./images/bill.png');
const groupImg = require('./images/groups.png');

const HomePage = () => {
  const navigate = useNavigate();

  return (
    <Layout>
      <div className="container">
        <h1 className="text-center pb-3 pt-3">Welcome to Housemates!</h1>
        <hr className="pb-5"></hr>
        <div className="row">
          <div className="col-md-3 d-flex align-items-center justify-content-center">
            <div className="card mb-3" style={{ maxWidth: "15rem" }}>
              <img src={groupImg} className="card-img-top mx-auto" alt="Group" />
              <div className="card-body text-center">
                <a href="/account/group" className="btn btn-primary">Groups</a>
              </div>
            </div>
          </div>

          <div className="col-md-3 d-flex align-items-center justify-content-center">
            <div className="card mb-3" style={{ maxWidth: "15rem" }}>
              <img src={taskImg} className="card-img-top mx-auto" alt="Tasks" />
              <div className="card-body text-center">
                <a href="/taskManagement" className="btn btn-primary">Tasks</a>
              </div>
            </div>
          </div>

          <div className="col-md-3 d-flex align-items-center justify-content-center">
            <div className="card mb-3" style={{ maxWidth: "15rem" }}>
              <img src={scheduleImg} className="card-img-top mx-auto" alt="Schedules" />
              <div className="card-body text-center">
                <a href="/Scheduling" className="btn btn-primary">Schedules</a>
              </div>
            </div>
          </div>

          <div className="col-md-3 d-flex align-items-center justify-content-center">
            <div className="card mb-3" style={{ maxWidth: "15rem" }}>
              <img src={billImg} className="card-img-top mx-auto" alt="Bills" />
              <div className="card-body text-center">
                <a href="/billManagement" className="btn btn-primary">Bills</a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default HomePage;
