
import { logSecurityEvent } from '../Components/AdminDashboard/SecurityLogs';

export const addTestData = async () => {
  const testEntries = [
    { action: 'LOGIN', resource: 'USER_INTERFACE' },
    { action: 'ENCRYPT', resource: 'ENCRYPTION_SERVICE' },
    { action: 'ACCESS_ADMIN', resource: 'ADMIN_DASHBOARD' }
  ];

  for (const entry of testEntries) {
    await logSecurityEvent('TEST_USER', entry.action, entry.resource);
  }
};