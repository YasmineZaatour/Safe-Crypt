import { encrypt, decrypt } from './encryption';

export const encryptUserData = (userData) => {
  const sensitiveFields = ['fullName', 'phone', 'address'];
  const encryptedData = { ...userData };

  sensitiveFields.forEach(field => {
    if (encryptedData[field]) {
      encryptedData[field] = encrypt(encryptedData[field]);
    }
  });

  return encryptedData;
};

export const decryptUserData = (userData) => {
  const sensitiveFields = ['fullName', 'phone', 'address'];
  const decryptedData = { ...userData };

  sensitiveFields.forEach(field => {
    if (decryptedData[field]) {
      try {
        decryptedData[field] = decrypt(decryptedData[field]);
      } catch (error) {
        console.error(`Error decrypting ${field}:`, error);
        decryptedData[field] = '[Decryption Error]';
      }
    }
  });

  return decryptedData;
};