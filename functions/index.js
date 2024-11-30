
const functions = require('firebase-functions');
const nodemailer = require('nodemailer');

exports.sendAdminVerification = functions.firestore
  .document('adminVerification/{docId}')
  .onCreate(async (snap, context) => {
    const data = snap.data();
    
    // Configure your email service
    const transporter = nodemailer.createTransport({
      // your email service configuration
    });

    await transporter.sendMail({
      from: 'your-app@domain.com',
      to: data.email,
      subject: 'Admin Verification Code',
      text: `Your verification code is: ${data.code}`
    });
  });