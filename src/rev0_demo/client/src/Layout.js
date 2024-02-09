import React from 'react';
import Navbar from './navbar';

function Layout({ children }) {
  return (
    <div>
      <Navbar />
      <div className="container">
        {children}
      </div>
    </div>
  );
}

export default Layout;
