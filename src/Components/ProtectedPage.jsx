import React, { useState, useEffect } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "../firebase";  

const ProtectedPage = () => {
  const [isEmailVerified, setIsEmailVerified] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        // Check if the user's email is verified
        setIsEmailVerified(user.emailVerified);
      }
      setLoading(false);
    });

    return unsubscribe; // Cleanup the listener on component unmount
  }, []);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!isEmailVerified) {
    return <div>Please verify your email before accessing this page.</div>;
  }

  return (
    <div>
      <h1>Welcome to the protected page!</h1>
    </div>
  );
};

export default ProtectedPage;
