import React, { useState, useEffect } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import SignUp from "./Components/SignUp";
import SignIn from "./Components/SignIn";
import MainPage from "./Components/MainPage";
import { auth } from "./firebase";
import { doc, updateDoc } from "firebase/firestore";
import { db } from "./firebase";

const App = () => {
  const [user, setUser] = useState(null);
  const [isPhoneVerified, setIsPhoneVerified] = useState(false); // Track phone verification status

  // Monitor authentication state
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (currentUser) => {
      if (currentUser) {
        console.log("User authenticated:", currentUser);
        await currentUser.reload(); // Ensure the latest user data
        const updatedUser = auth.currentUser;
        console.log("Email Verified:", updatedUser.emailVerified); // Track email verification
        console.log("User:", updatedUser);

        setUser(updatedUser);

        if (updatedUser.emailVerified) {
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
        {/* Redirect root path to /signin */}
        <Route path="/" element={<Navigate to="/signin" />} />
        {/* Sign-Up Page */}
        <Route path="/signup" element={<SignUp />} />
        {/* Sign-In Page */}
        <Route
          path="/signin"
          element={
            user ? (
              isPhoneVerified ? (
                <Navigate to="/main" />
              ) : (
                <SignIn setIsPhoneVerified={setIsPhoneVerified} />
              )
            ) : (
              <SignIn setIsPhoneVerified={setIsPhoneVerified} />
            )
          }
        />
        {/* Main Page */}
        <Route
          path="/main"
          element={
            user && isPhoneVerified ? <MainPage /> : <Navigate to="/signin" />
          }
        />
      </Routes>
    </Router>
  );
};

export default App;
