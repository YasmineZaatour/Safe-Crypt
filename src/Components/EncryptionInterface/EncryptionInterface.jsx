import React, { useState } from 'react';
import './EncryptionInterface.css';
import { motion } from 'framer-motion';
import CryptoJS from 'crypto-js';

const EncryptionInterface = () => {
  const [message, setMessage] = useState('');
  const [key, setKey] = useState('');
  const [result, setResult] = useState('');
  const [encryptionType, setEncryptionType] = useState('aes');
  const [aesType, setAesType] = useState('128');
  const [isEncrypting, setIsEncrypting] = useState(true);

  const caesarCipherEncrypt = (text, shift) => {
    return Array.from(text).map(char => {
      const code = char.codePointAt(0);
      // Handle all Unicode characters (including emojis)
      // Use modulo with full Unicode range
      return String.fromCodePoint((code + shift) % 0x10FFFF);
    }).join('');
  };

  const caesarCipherDecrypt = (text, shift) => {
    return Array.from(text).map(char => {
      const code = char.codePointAt(0);
      // Handle negative shifts for decryption
      let newCode = code - shift;
      if (newCode < 0) {
        newCode += 0x10FFFF; // Add full Unicode range if result is negative
      }
      return String.fromCodePoint(newCode);
    }).join('');
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    let processedMessage = '';

    if (encryptionType === 'aes') {
      try {
        // Convert key size from bits to bytes
        const keySize = parseInt(aesType);
        
        // Ensure the key meets the size requirement by padding or hashing
        const derivedKey = CryptoJS.PBKDF2(key, 'salt', {
          keySize: keySize / 32, // keySize in words (32 bits each)
          iterations: 1000
        });

        if (isEncrypting) {
          // Generate random IV
          const iv = CryptoJS.lib.WordArray.random(16);
          // Convert message to UTF-8 before encryption
          const utf8Message = CryptoJS.enc.Utf8.parse(message);
          
          // Encrypt with the chosen key size
          const encrypted = CryptoJS.AES.encrypt(utf8Message, derivedKey, {
            iv: iv,
            mode: CryptoJS.mode.CBC,
            padding: CryptoJS.pad.Pkcs7
          });

          // Combine IV and encrypted message
          processedMessage = iv.toString() + encrypted.toString();
        } else {
          try {
            // Extract IV from the beginning of the message (first 32 chars)
            const ivStr = message.substr(0, 32);
            const ciphertext = message.substr(32);
            
            // Convert IV from hex string to WordArray
            const iv = CryptoJS.enc.Hex.parse(ivStr);
            
            // Decrypt with the chosen key size
            const decrypted = CryptoJS.AES.decrypt(ciphertext, derivedKey, {
              iv: iv,
              mode: CryptoJS.mode.CBC,
              padding: CryptoJS.pad.Pkcs7
            });
            
            // Ensure proper UTF-8 decoding
            processedMessage = decrypted.toString(CryptoJS.enc.Utf8);
          } catch (error) {
            processedMessage = 'Decryption failed. Please check your key and input.';
          }
        }
      } catch (error) {
        processedMessage = 'Operation failed. Please check your inputs.';
      }
    } else if (encryptionType === 'caesar') {
      const shift = parseInt(key, 10);
      processedMessage = isEncrypting 
        ? caesarCipherEncrypt(message, shift)
        : caesarCipherDecrypt(message, shift);
    }

    setResult(processedMessage);
  };

  return (
    <motion.div 
      className="encryption-container"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <div className="encryption-card">
        <div className="mode-toggle">
          <button 
            className={isEncrypting ? 'active' : ''}
            onClick={() => setIsEncrypting(true)}
          >
            Encrypt
          </button>
          <button 
            className={!isEncrypting ? 'active' : ''}
            onClick={() => setIsEncrypting(false)}
          >
            Decrypt
          </button>
        </div>

        <form onSubmit={handleSubmit} className="encryption-form">
          <div className="algorithm-selection">
            <label>Select Algorithm:</label>
            <select 
              value={encryptionType}
              onChange={(e) => setEncryptionType(e.target.value)}
            >
              <option value="aes">AES</option>
              <option value="caesar">Caesar Cipher</option>
            </select>

            {encryptionType === 'aes' && (
              <select 
                value={aesType}
                onChange={(e) => setAesType(e.target.value)}
              >
                <option value="128">128 bits</option>
                <option value="192">192 bits</option>
                <option value="256">256 bits</option>
              </select>
            )}
          </div>

          <motion.div 
            className="input-group"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            <textarea
              placeholder="Enter your message here..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              required
            />
          </motion.div>

          {encryptionType === 'caesar' && (
            <motion.div 
              className="input-group"
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.3 }}
            >
              <input
                type="password"
                placeholder="Enter encryption key"
                value={key}
                onChange={(e) => setKey(e.target.value)}
                required
              />
            </motion.div>
          )}

          <motion.button 
            type="submit"
            className="submit-button"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            {isEncrypting ? 'Encrypt' : 'Decrypt'}
          </motion.button>
        </form>

        {result && (
          <motion.div 
            className="result-container"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            <h3>Result:</h3>
            <div className="result-box">
              <p>{result}</p>
              <button 
                className="copy-button"
                onClick={() => navigator.clipboard.writeText(result)}
              >
                Copy
              </button>
            </div>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
};

export default EncryptionInterface;