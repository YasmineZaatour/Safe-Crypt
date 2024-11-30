import React, { useState } from 'react';
import { createUserWithEmailAndPassword } from "firebase/auth";
import { auth } from '../../firebase';
import { getFirestore, doc, setDoc } from "firebase/firestore";
import { useNavigate } from 'react-router-dom';
import './SignUp.css';
import logSecurityEvent from '../../utils/securityLogger';

const SignUp = () => {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: ''
  });

  const navigate = useNavigate(); // Initialize useNavigate

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      await logSecurityEvent({
        email: formData.email,
        action: 'SIGNUP_FAILED',
        resource: 'Authentication',
        details: {
          error: 'Password mismatch',
          attemptedEmail: formData.email
        },
        timestamp: new Date() // Add explicit timestamp
      });
      alert("Passwords do not match");
      return;
    }
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, formData.email, formData.password);
      const user = userCredential.user;
      const db = getFirestore();
      await setDoc(doc(db, "users", user.uid), {
        fullName: formData.fullName,
        email: formData.email,
        role: 'user',
        verified: false, // Add verified status
        createdAt: new Date()
      });

      navigate("/signin");
    } catch (error) {
      await logSecurityEvent({
        email: formData.email,
        action: 'SIGNUP_FAILED',
        resource: 'Authentication',
        details: {
          error: error.message,
          errorCode: error.code || 'unknown',
          attemptedEmail: formData.email
        },
        timestamp: new Date() // Add explicit timestamp
      });
      alert(error.message);
    }
  };

  return (
    <div className="signup-container">
      <div className="signup-card">
        <h2>Create Account</h2>
        <p>Please fill in your information</p>
        
        <form onSubmit={handleSubmit} className="signup-form">
          <div className="form-group">
            <input
              type="text"
              name="fullName"
              placeholder="Full Name"
              value={formData.fullName}
              onChange={handleChange}
              required
            />
          </div>
          
          <div className="form-group">
            <input
              type="email"
              name="email"
              placeholder="Email"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>
          
          <div className="form-group">
            <input
              type="password"
              name="password"
              placeholder="Password"
              value={formData.password}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <input
              type="password"
              name="confirmPassword"
              placeholder="Confirm Password"
              value={formData.confirmPassword}
              onChange={handleChange}
              required
            />
          </div>
          
          <button type="submit" className="signup-button">
            Sign Up
          </button>
        </form>
        
        <div className="signup-footer">
          <p>Already have an account? <a href="/signin">Sign In </a></p>
        </div>
      </div>
    </div>
  );
};

export default SignUp;