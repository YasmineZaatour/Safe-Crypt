import React, { useState } from "react";
import { createUserWithEmailAndPassword, sendEmailVerification } from "firebase/auth";
import { auth } from "../firebase";
import { setDoc, doc } from "firebase/firestore";
import { db } from "../firebase"; 
import GoogleAuth from "./GoogleAuth";

const SignUp = () => {
  const [fullName, setFullName] = useState(""); 
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSignUp = async (e) => {
    e.preventDefault();
    try {
      // Create user with Firebase Authentication
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Save the full name and email to Firestore (not password)
      await setDoc(doc(db, "users", user.uid), {
        fullName,
        email,
      });
      await sendEmailVerification(user);

      console.log("User signed up and saved to Firestore!");
      alert("A verification email has been sent to your email. Please check your inbox.");
      // You can now redirect or show a success message
    } catch (error) {
      setError(error.message); // Handle any errors such as weak password, email in use, etc.
    }
  };

  return (
    <div className="w-[522px] h-[600px] mt-32 ml-[600px] p-5 bg-cyan text-center rounded-[15px] signUpContainer">
      <h2 className="text-white text-[40px] mb-[50px]">Register</h2>
      <p className="text-white text-[20px] mb-[10px] font-semibold">Add all information</p>
      
      <form onSubmit={handleSignUp}>
        <input
          className="block w-[380px] h-[45px] rounded-lg mb-4 border-none mx-auto px-3 text-black"
          type="text"
          placeholder="Full Name"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}  
        />
        <input
          className="block w-[380px] h-[45px] rounded-lg mb-4 border-none mx-auto px-3 text-black"
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <input
          className="block w-[380px] h-[45px] rounded-lg mb-4 border-none mx-auto px-3 text-black"
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        
        {error && <p className="text-red-500 text-sm">{error}</p>}
        
        <div className="flex items-center text-white mx-[53px] my-[10px] signUp-divider">
          <hr className="flex-1 border-none h-px bg-white" />
          <span className="px-[20px]">Or</span>
          <hr className="flex-1 border-none h-px bg-white" />
        </div>
        
        <GoogleAuth />
        
        <button
          type="submit"
          className="w-96 h-12 bg-customBlue rounded-lg border-none text-white text-lg font-bold signUp-btn"
        >
          Continue
        </button>
      </form>
    </div>
  );
};

export default SignUp;
