import React from 'react';
import AuthDetails from "../AuthDetails"
import Layout from '../Layout';

function Account() {
  return (
    <Layout>
      <div>
        <h1>Account Page</h1>
        <AuthDetails />
      </div>
      </Layout>
  );
}

export default Account;
