import React, { useState } from 'react';
import './EncryptionInterface.css';
import { motion } from 'framer-motion';

const EncryptionInterface = () => {
  const [message, setMessage] = useState('');
  const [key, setKey] = useState('');
  const [result, setResult] = useState('');
  const [encryptionType, setEncryptionType] = useState('aes');
  const [aesType, setAesType] = useState('128');
  const [isEncrypting, setIsEncrypting] = useState(true);

  const handleSubmit = (e) => {
    e.preventDefault();
    // TODO: Implement actual encryption/decryption logic
    setResult('Encryption result will appear here');
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