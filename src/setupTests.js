// src/setupTests.js

// jest-dom adds custom jest matchers for asserting on DOM nodes.
// allows you to do things like:
// expect(element).toHaveTextContent(/react/i)
// learn more: https://github.com/testing-library/jest-dom
import '@testing-library/jest-dom';
import dotenv from 'dotenv';

// Load environment variables from .env file
dotenv.config({ path: '../.env' });
console.log('Firebase API Key:', process.env.REACT_APP_FIREBASE_API_KEY);