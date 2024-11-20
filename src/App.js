import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import SignUp from "./Components/SignUp";
import SignIn from "./Components/SignIn";
import MainPage from "./Components/MainPage";
import { auth } from "./firebase";
import { doc, updateDoc } from "firebase/firestore";
import { db } from "./firebase";

const App = () => {
  const [user, setUser] = useState(null);

  // Monitor authentication state
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (currentUser) => {
      if (currentUser) {
        // Reload the user to get the latest email verification status
        await currentUser.reload();
        const updatedUser = auth.currentUser;

        setUser(updatedUser);

        // Check if the email is verified
        if (updatedUser.emailVerified) {
          // Update Firestore to reflect that the email is verified
          const userDocRef = doc(db, "users", updatedUser.uid);
          await updateDoc(userDocRef, {
            emailVerified: true,
          });
        }
      } else {
        setUser(null);
      }
    });

    return () => unsubscribe(); // Cleanup the listener
  }, []);

  return (
    <Router>
      <Routes>
        {/* Sign-Up Page */}
        <Route path="/" element={<SignUp />} />
        {/* Sign-In Page */}
        <Route path="/signin" element={user ? <Navigate to="/main" /> : <SignIn />} />
        {/* Main Page */}
        <Route path="/main" element={user ? <MainPage /> : <Navigate to="/signin" />} />
      </Routes>
    </Router>
  );
};

export default App;