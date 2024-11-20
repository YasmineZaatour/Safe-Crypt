import React from "react";
import { signInWithPopup } from "firebase/auth";
import { auth, googleProvider } from "../firebase";
import googleI from "../Assets/googleI.png";
import { setDoc, doc, getDoc } from "firebase/firestore";
import { db } from "../firebase"; 

const GoogleAuth = () => {
    const handleGoogleSignIn = async () => {
        try {
          const result = await signInWithPopup(auth, googleProvider);
          const user = result.user;
    
          // Firestore user document reference
          const userDocRef = doc(db, "users", user.uid);
          const userDoc = await getDoc(userDocRef);
    
          // If the user does not already exist, create their document
          if (!userDoc.exists()) {
            await setDoc(userDocRef, {
              fullName: user.displayName || "Anonymous", // Handle missing display name
              email: user.email,
            });
            console.log("New user added to Firestore.");
          } else {
            console.log("User already exists in Firestore.");
          }
        } catch (error) {
          console.error("Error during Google sign-in:", error.message);
        }
      };

  return (
    <div>
      <button
        onClick={handleGoogleSignIn}
        className="w-[380px] h-12 bg-white rounded-lg border-none text-black text-lg font-bold mt-[10px] mb-[15px]"
      >
        <div className="flex justify-center icons">
            
            <img
                className="w-[38px] h-[39px] mb-[5px] google-icon"
                src={googleI}
                alt="Google logo"
            />
            <span className="mt-[5px]" > Sign in with Google </span>
        </div>
        
      </button>
    </div>
  );
};

export default GoogleAuth;
