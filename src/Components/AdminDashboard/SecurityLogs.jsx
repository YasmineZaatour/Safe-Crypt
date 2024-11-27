
import React from 'react';
import {
  Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Paper, Typography
} from '@mui/material';

const SecurityLogs = () => {
  const logs = [
    {
      id: 1,
      timestamp: '2024-01-20 10:30:15',
      userId: 'user@example.com',
      ipAddress: '192.168.1.1',
      action: 'Login successful',
      resource: 'Encryption Interface'
    },
    // Add more mock data as needed
  ];

  return (
    <Paper sx={{ width: '100%', overflow: 'hidden' }}>
      <Typography variant="h6" sx={{ p: 2 }}>Security Logs</Typography>
      <TableContainer>
        <Table stickyHeader>
          <TableHead>
            <TableRow>
              <TableCell>Timestamp</TableCell>
              <TableCell>User ID</TableCell>
              <TableCell>IP Address</TableCell>
              <TableCell>Action</TableCell>
              <TableCell>Resource</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {logs.map((log) => (
              <TableRow key={log.id}>
                <TableCell>{log.timestamp}</TableCell>
                <TableCell>{log.userId}</TableCell>
                <TableCell>{log.ipAddress}</TableCell>
                <TableCell>{log.action}</TableCell>
                <TableCell>{log.resource}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Paper>
  );
};

export default SecurityLogs;