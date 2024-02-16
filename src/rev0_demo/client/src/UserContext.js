// UserContext.js
import React, { createContext, useState, useContext, useEffect } from 'react';
import { auth } from './firebase';
import axios from 'axios';

const UserContext = createContext();

export const useUser = () => useContext(UserContext);

export const UserProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const getUserData = async () => {
      setIsLoading(true);
      if (auth.currentUser) {
        try {
          const response = await axios.get('http://localhost:5000/api/account/user/', {
            params: { email: auth.currentUser.email }
          });
          setCurrentUser(response.data);
        } catch (error) {
          setError(error);
        }
      }
      setIsLoading(false);
    };

    const unsubscribe = auth.onAuthStateChanged(user => {
      if (user) {
        getUserData();
      } else {
        setCurrentUser(null);
      }
    });

    // Cleanup subscription on unmount
    return () => unsubscribe();
  }, []);

  return (
    <UserContext.Provider value={{ currentUser, isLoading, error }}>
      {children}
    </UserContext.Provider>
  );
};
