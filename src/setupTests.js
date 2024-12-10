// src/setupTests.js
import '@testing-library/jest-dom';
import dotenv from 'dotenv';

// Mock Firebase
jest.mock('firebase/app', () => ({
  initializeApp: jest.fn(),
}));

jest.mock('firebase/auth', () => ({
  getAuth: jest.fn(),
}));

jest.mock('firebase/firestore', () => ({
  getFirestore: jest.fn(),
}));

dotenv.config({ path: '../.env' });