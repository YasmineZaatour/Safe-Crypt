import React, { useState } from "react";
import { signInWithEmailAndPassword } from "firebase/auth";  
import { auth } from "../firebase";  
import GoogleAuth from "./GoogleAuth";
import { useNavigate } from "react-router-dom";

const SignIn = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSignIn = async (e) => {
    e.preventDefault();

    try {
      await signInWithEmailAndPassword(auth, email, password);
      // Redirect user to a different page or show success
      console.log("User signed in!");
      navigate("/main");
    } catch (error) {
      setError(error.message); // Handle errors (like incorrect password or email not registered)
    }
  };

  return (
    <div className="w-[522px] h-[540px] ml-[600px] mt-[150px] p-[20px] bg-cyan text-center rounded-[15px] signInContainer">
      <h2 className="text-white text-[40px] mb-[50px]">Login</h2>
      <p className="text-white text-[20px] mb-[10px] font-semibold">
        Enter your e-mail and password
      </p>
      <input
        className="block w-[380px] h-[45px] rounded-lg mb-5 border-white mx-auto px-3 py-2 mt-2 text-black signIn-email"
        type="email"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}  
      />
      <div className="relative">
        <input
          className="block w-96 h-12 rounded-lg mb-5 border-white mx-auto px-3 py-2 mt-2 text-black signIn-password"
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)} 
        />
      </div>
      {error && <p className="text-red-500">{error}</p>}
      
      <div className="flex items-center text-white mx-[50px] my-55 signIn-divider">
        <hr className="flex-1 border-none h-px bg-white" />
        <span className="px-5">Or</span>
        <hr className="flex-1 border-none h-px bg-white" />
      </div>

      <GoogleAuth />
      
      <button
        className="w-[380px] h-12 bg-customBlue rounded-lg border-none text-white text-lg font-bold mt-[3px] signIn-btn"
        onClick={handleSignIn} 
      >
        Continue
      </button>
    </div>
  );
};

export default SignIn;
