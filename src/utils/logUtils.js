import { collection, addDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { auth } from '../firebase';

const logActivity = async (action, resource, details) => {
  try {
    const user = auth.currentUser;
    if (!user || !user.email) {
      throw new Error('No authenticated admin user found');
    }

    await addDoc(collection(db, 'securityLogs'), {
      timestamp: new Date(),
      email: user.email,  // This will now always be the admin's email
      action,
      resource,
      details,
      userId: user.uid    // Adding userId for additional tracking
    });
  } catch (error) {
    console.error('Error logging activity:', error);
    // Re-throw the error so the calling component can handle it
    throw error;
  }
};

export default logActivity;