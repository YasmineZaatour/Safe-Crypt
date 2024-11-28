import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from '../../firebase';
import { getFirestore, doc, getDoc } from "firebase/firestore";
import './SignIn.css';

const SignIn = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [error, setError] = useState('');  // Add error state
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(''); // Clear any previous errors
    try {
      const userCredential = await signInWithEmailAndPassword(auth, formData.email, formData.password);
      const user = userCredential.user;
      const db = getFirestore();
      const userDoc = await getDoc(doc(db, "users", user.uid));
      const userData = userDoc.data();
      
      if (userData.status === 'inactive') {
        setError('Your account is inactive. Please contact an administrator to reactivate it.');
        await auth.signOut();
        return;
      }
      
      if (userData.role === 'admin') {
        navigate('/admin-dashboard');
      } else if (!userData.verified) {
        setError('Your account is pending verification. Please wait for an administrator to verify your account.');
      } else {
        // Store user status in localStorage for the EncryptionInterface to check
        localStorage.setItem('userStatus', userData.status);
        navigate('/encryption-interface');
      }
    } catch (error) {
      setError(error.message);
    }
  };

  return (
    <div className="signin-container">
      <div className="signin-card">
        <h2>Welcome Back</h2>
        <p>Please sign in to continue</p>
        
        {error && (
          <div className="error-message" style={{
            color: 'red',
            backgroundColor: '#ffebee',
            padding: '10px',
            borderRadius: '4px',
            marginBottom: '15px'
          }}>
            {error}
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="signin-form">
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
          
          <button type="submit" className="signin-button">
            Sign In
          </button>
        </form>
        
        <div className="signin-footer">
          <p>Don't have an account? <a href="/signup">Sign Up</a></p>
        </div>
      </div>
    </div>
  );
};

export default SignIn;