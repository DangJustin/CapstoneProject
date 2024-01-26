import { onAuthStateChanged } from "firebase/auth";
import React, { useEffect, useState } from "react";
import { auth } from "./firebase";

const AuthDetails = () => {
  const [authUser, setAuthUser] = useState(null);

  useEffect(() => {
    const listen = onAuthStateChanged(auth, (user) => {
      if (user) {
        setAuthUser(user);
      } else {
        setAuthUser(null);
      }
    });

    return listen; // This may need to be `return () => listen();` if listen is a function
  }, []);

  return <div>
    {authUser ? <p>Logged In as {authUser.email} </p> : <span>Signed Out</span>}
  </div>;
};

export default AuthDetails;