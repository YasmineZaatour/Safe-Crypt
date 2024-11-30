import React, { useEffect, useState } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { auth } from './firebase';
import SignIn from "./Components/SignIn/SignIn.jsx";
import SignUp from "./Components/SignUp/SignUp.jsx";
import AdminDashboard from "./Components/AdminDashboard/AdminDashboard.jsx";
import EncryptionInterface from "./Components/EncryptionInterface/EncryptionInterface.jsx";
import AdminVerification from "./Components/AdminVerification/AdminVerification.jsx";
function App() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      setUser(user);
    });

    return () => unsubscribe();
  }, []);

  return (
    <div>
      <Router>
        <Routes>
          <Route path="/signin" element={<SignIn />} />
          <Route path="/signup" element={<SignUp />} />
          <Route path="/admin-dashboard" element={<AdminDashboard />} />
          <Route path="/encryption-interface" element={<EncryptionInterface />} />
          <Route path="/admin-verification" element={<AdminVerification />} />
          <Route path="*" element={<Navigate to="/signin" />} />
        </Routes>
      </Router>
    </div>
  );
}

export default App;