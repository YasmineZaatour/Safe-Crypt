// src/firebase.js
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Firebase configuration object (replace with your own credentials)
const firebaseConfig = {
    apiKey: "AIzaSyCrtexwhqGjqNi-QCmEgClqzZtGm_KZf_Q",
    authDomain: "safecrypt-8eb4d.firebaseapp.com",
    projectId: "safecrypt-8eb4d",
    storageBucket: "safecrypt-8eb4d.firebasestorage.app",
    messagingSenderId: "1031860567904",
    appId: "1:1031860567904:web:b94eefb4fa6451f2e92805"
  };

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

export { auth, db };
