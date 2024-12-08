const express = require('express');
const nodemailer = require('nodemailer');
const cors = require('cors');
require('dotenv').config();

const app = express();

// More permissive CORS for development
app.use(cors());
app.use(express.json());

// Store verification codes temporarily
const verificationCodes = new Map();

// Create reusable transporter
const transporter = nodemailer.createTransport({
    service: 'gmail',
    host: 'smtp.gmail.com',
    port: 587,
    secure: false, // Use TLS
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_APP_PASSWORD
    }
  });
  console.log('Email User:', process.env.EMAIL_USER);
  console.log('Email Password:', process.env.EMAIL_APP_PASSWORD);
// Verify connection configuration
transporter.verify(function(error, success) {
  if (error) {
    console.error('SMTP connection error:', error);
  } else {
    console.log('Server is ready to take our messages');
  }
});

app.post('/api/send-verification', async (req, res) => {
  const { email } = req.body;
  console.log('Attempting to send verification to:', email);

  if (!email) {
    return res.status(400).json({ 
      success: false, 
      error: 'Email is required' 
    });
  }

  try {
    const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
    
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'Safe-Crypt Admin Verification Code',
      text: `Your verification code is: ${verificationCode}`, // Plain text fallback
      html: `
        <div style="padding: 20px; background-color: #f5f5f5;">
          <h2 style="color: #333;">Safe-Crypt Admin Verification</h2>
          <p>Your verification code is:</p>
          <h1 style="color: #4CAF50; font-size: 32px;">${verificationCode}</h1>
          <p>This code will expire in 5 minutes.</p>
        </div>
      `
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('Message sent: %s', info.messageId);

    verificationCodes.set(email, {
      code: verificationCode,
      expiry: Date.now() + 300000
    });

    res.json({ success: true });
  } catch (error) {
    console.error('Email sending error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to send verification email',
      details: error.message 
    });
  }
});

app.post('/api/verify-code', (req, res) => {
  const { email, code } = req.body;
  const storedData = verificationCodes.get(email);

  if (!storedData) {
    return res.json({ success: false, error: 'No verification code found' });
  }

  if (Date.now() > storedData.expiry) {
    verificationCodes.delete(email);
    return res.json({ success: false, error: 'Verification code expired' });
  }

  if (storedData.code === code) {
    verificationCodes.delete(email);
    return res.json({ success: true });
  }

  res.json({ success: false, error: 'Invalid verification code' });
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});