import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from '../../firebase';
import { getFirestore, doc, getDoc, updateDoc, serverTimestamp } from "firebase/firestore";
import './SignIn.css';
import logSecurityEvent from '../../utils/securityLogger';
import ReCAPTCHA from "react-google-recaptcha";

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001';

const SignIn = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [showVerification, setShowVerification] = useState(false);
  const [verificationCode, setVerificationCode] = useState('');
  const [captchaToken, setCaptchaToken] = useState(null);
  const recaptchaRef = useRef(null);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleVerifyCode = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`${API_URL}/api/verify-code`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: formData.email,
          code: verificationCode
        })
      });

      const data = await response.json();
      if (data.success) {
        navigate('/admin-dashboard');
      } else {
        setError(data.error || 'Invalid verification code');
      }
    } catch (error) {
      setError('Verification failed');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!captchaToken) {
      setError('Please complete the reCAPTCHA verification');
      return;
    }

    try {
      const userCredential = await signInWithEmailAndPassword(auth, formData.email, formData.password);
      const user = userCredential.user;
      
      // Log successful login
      await logSecurityEvent({
        userId: user.uid,
        email: user.email,
        action: 'LOGIN',
        resource: 'Authentication',
        details: { success: true }
      });

      const db = getFirestore();
      const userDocRef = doc(db, "users", user.uid);
      const userDoc = await getDoc(userDocRef);
      const userData = userDoc.data();
      
      await updateDoc(userDocRef, {
        lastLogin: serverTimestamp()
      });
      
      if (userData.status === 'inactive') {
        setError('Your account is inactive. Please contact an administrator.');
        await auth.signOut();
        return;
      }
      
      if (userData.role === 'admin') {
        try {
          console.log('Sending verification to:', formData.email);
          const response = await fetch(`${API_URL}/api/send-verification`, {
            method: 'POST',
            headers: { 
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({ 
              email: formData.email.trim() 
            })
          });

          const data = await response.json();
          console.log('Server response:', data);

          if (!response.ok) {
            throw new Error(data.error || `Server error: ${response.status}`);
          }

          if (data.success) {
            setShowVerification(true);
          } else {
            throw new Error(data.error || 'Verification failed');
          }
        } catch (error) {
          console.error('Verification error:', error);
          setError(error.message);
          await auth.signOut();
        }
      } else if (!userData.verified) {
        setError('Account pending verification. Please wait for admin approval.');
      } else {
        localStorage.setItem('userStatus', userData.status);
        navigate('/encryption-interface');
      }
    } catch (error) {
      if (recaptchaRef.current) {
        recaptchaRef.current.reset();
      }
      setCaptchaToken(null);
      // Modified error logging
      await logSecurityEvent({
        email: formData.email,
        action: 'LOGIN_FAILED',
        resource: 'Authentication',
        details: {
          error: error.message,
          errorCode: error.code || 'unknown',
          attemptedEmail: formData.email
        },
        timestamp: new Date() // Add explicit timestamp
      });
      setError(error.message);
    }
  };

  if (showVerification) {
    return (
      <div className="verification-container">
        <div className="verification-card">
          <h2>Verify Your Identity</h2>
          <p>Please enter the verification code sent to {formData.email}</p>
          
          {error && (
            <div className="error-message">
              {error}
            </div>
          )}
          
          <form onSubmit={handleVerifyCode}>
            <input
              type="text"
              value={verificationCode}
              onChange={(e) => setVerificationCode(e.target.value)}
              placeholder="Enter verification code"
              required
            />
            <button type="submit">Verify</button>
          </form>
        </div>
      </div>
    );
  }

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
          
          <div className="recaptcha-container" style={{ margin: '20px 0' }}>
            <ReCAPTCHA
              ref={recaptchaRef}
              sitekey={process.env.REACT_APP_RECAPTCHA_SITE_KEY}
              onChange={(token) => setCaptchaToken(token)}
              onExpired={() => setCaptchaToken(null)}
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

// Make sure there's only one export and it's properly defined
export default SignIn;