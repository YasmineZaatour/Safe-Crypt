import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase';

const logSecurityEvent = async ({
    userId = null,  // Make userId optional
    email,
    action,
    resource,
    details = {},
    timestamp = null
  }) => {
    try {
      await addDoc(collection(db, 'securityLogs'), {
        ...(userId && { userId }), // Only include userId if it exists
        email,
        action,
        resource,
        details,
        timestamp: serverTimestamp(),
        clientTimestamp: timestamp || new Date()
      });
    } catch (error) {
      console.error('Error logging security event:', error);
      // Consider additional error handling here
    }
  };

export default logSecurityEvent;