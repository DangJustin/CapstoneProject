import React from 'react';
import Navbar from './navbar';

function Layout({ children }) {
  return (
    <div>
      <link href="https://fonts.googleapis.com/css2?family=Dosis:wght@600&family=Exo:ital,wght@0,100..900;1,100..900&display=swap" rel="stylesheet"></link>
      <Navbar />
      <div className="container">
        {children}
      </div>
    </div>
  );
}

export default Layout;
