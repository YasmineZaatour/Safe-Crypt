import React, { useState, useRef } from 'react';
import ReCAPTCHA from "react-google-recaptcha";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { auth } from '../../firebase';
import { getFirestore, doc, setDoc } from "firebase/firestore";
import { useNavigate } from 'react-router-dom';
import './SignUp.css';
import logSecurityEvent from '../../utils/securityLogger';
import validatePassword from '../../utils/passwordValidation';
import validateEmail from '../../utils/emailValidation';

const SignUp = () => {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [captchaToken, setCaptchaToken] = useState(null);
  const recaptchaRef = useRef(null);
  const [passwordErrors, setPasswordErrors] = useState([]);
  const [emailErrors, setEmailErrors] = useState([]);

  const navigate = useNavigate(); // Initialize useNavigate

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });

    // Validate password as user types
    if (e.target.name === 'password') {
      const { errors } = validatePassword(e.target.value);
      setPasswordErrors(errors);
    }

    if (e.target.name === 'email') {
      const { errors } = validateEmail(e.target.value);
      setEmailErrors(errors);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate email before submission
    const emailValidation = validateEmail(formData.email);
    if (!emailValidation.isValid) {
      alert(emailValidation.errors.join('\n'));
      return;
    }

    // Validate password before submission
    const { isValid, errors } = validatePassword(formData.password);
    if (!isValid) {
      alert(errors.join('\n'));
      return;
    }

    if (!captchaToken) {
      await logSecurityEvent({
        email: formData.email,
        action: 'SIGNUP_ATTEMPT_BLOCKED',
        resource: 'Authentication',
        details: {
          error: 'reCAPTCHA verification missing',
          attemptedEmail: formData.email,
          severity: 'medium'
        },
        timestamp: new Date()
      });
      alert("Please complete the reCAPTCHA verification");
      return;
    }

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
      if (recaptchaRef.current) {
        recaptchaRef.current.reset();
      }
      setCaptchaToken(null);
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
            {emailErrors.length > 0 && (
              <div className="email-requirements" style={{
                fontSize: '0.8rem',
                color: '#d32f2f',
                marginTop: '5px'
              }}>
                {emailErrors.map((error, index) => (
                  <div key={index}>{error}</div>
                ))}
              </div>
            )}
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
            {passwordErrors.length > 0 && (
              <div className="password-requirements" style={{
                fontSize: '0.8rem',
                color: '#d32f2f',
                marginTop: '5px'
              }}>
                {passwordErrors.map((error, index) => (
                  <div key={index}>{error}</div>
                ))}
              </div>
            )}
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

          <div className="recaptcha-container" style={{ margin: '20px 0' }}>
            <ReCAPTCHA
              ref={recaptchaRef}
              sitekey={process.env.REACT_APP_RECAPTCHA_SITE_KEY}
              onChange={(token) => setCaptchaToken(token)}
              onExpired={() => setCaptchaToken(null)}
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