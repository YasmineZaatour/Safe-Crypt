
import CryptoJS from 'crypto-js';

const ENCRYPTION_KEY = process.env.REACT_APP_ENCRYPTION_KEY || 'your-fallback-key';

export const encryptData = (data) => {
  if (!data) return null;
  
  try {
    const stringData = typeof data === 'object' ? JSON.stringify(data) : String(data);
    return CryptoJS.AES.encrypt(stringData, ENCRYPTION_KEY).toString();
  } catch (error) {
    console.error('Encryption error:', error);
    throw new Error('Failed to encrypt data');
  }
};

export const decryptData = (encryptedData) => {
  if (!encryptedData) return null;
  
  try {
    const bytes = CryptoJS.AES.decrypt(encryptedData, ENCRYPTION_KEY);
    const decryptedString = bytes.toString(CryptoJS.enc.Utf8);
    
    try {
      return JSON.parse(decryptedString);
    } catch {
      return decryptedString;
    }
  } catch (error) {
    console.error('Decryption error:', error);
    throw new Error('Failed to decrypt data');
  }
};

export const encryptObject = (obj) => {
  const encryptedObj = {};
  
  for (const [key, value] of Object.entries(obj)) {
    // Skip encryption for specific fields
    if (['id', 'createdAt', 'updatedAt'].includes(key)) {
      encryptedObj[key] = value;
      continue;
    }
    
    encryptedObj[key] = encryptData(value);
  }
  
  return encryptedObj;
};

export const decryptObject = (obj) => {
  const decryptedObj = {};
  
  for (const [key, value] of Object.entries(obj)) {
    // Skip decryption for specific fields
    if (['id', 'createdAt', 'updatedAt'].includes(key)) {
      decryptedObj[key] = value;
      continue;
    }
    
    decryptedObj[key] = decryptData(value);
  }
  
  return decryptedObj;
};