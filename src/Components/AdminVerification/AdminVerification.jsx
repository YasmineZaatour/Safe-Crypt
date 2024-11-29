import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './AdminVerification.css';

const AdminVerification = ({ email }) => {
  const [verificationCode, setVerificationCode] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    
    try {
      const response = await fetch('http://localhost:3001/api/verify-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, code: verificationCode })
      });

      const data = await response.json();
      if (data.success) {
        navigate('/admin-dashboard');
      } else {
        setError('Invalid verification code');
      }
    } catch (error) {
      setError('Verification failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="verification-container">
      <div className="verification-card">
        <h2>Verify Your Identity</h2>
        <p>We've sent a verification code to<br /><strong>{email}</strong></p>
        
        {error && (
          <div className="error-message">
            {error}
          </div>
        )}
        
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            value={verificationCode}
            onChange={(e) => setVerificationCode(e.target.value)}
            placeholder="Enter verification code"
            required
            maxLength="6"
            pattern="\d*"
            title="Please enter numbers only"
            disabled={isLoading}
          />
          <button 
            type="submit" 
            disabled={isLoading}
          >
            {isLoading ? 'Verifying...' : 'Verify'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AdminVerification;