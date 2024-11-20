import React from "react";
import { auth } from "../firebase";

const MainPage = () => {
  const handleLogout = () => {
    auth.signOut();
  };

  return (
    <div>
      <h1>Welcome to the Main Page!</h1>
      <button onClick={handleLogout}>Log Out</button>
    </div>
  );
};

export default MainPage;
