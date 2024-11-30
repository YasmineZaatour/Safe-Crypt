import React, { useState, useEffect } from 'react';
import {
  Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Paper, Typography,
  CircularProgress, Box, Chip
} from '@mui/material';
import { collection, query, orderBy, limit, getDocs, startAfter } from 'firebase/firestore';
import { db } from '../../firebase';

const SecurityLogs = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [lastVisible, setLastVisible] = useState(null);
  const LOGS_PER_PAGE = 50;

  const fetchLogs = async () => {
    try {
      setLoading(true);
      const logsQuery = query(
        collection(db, 'securityLogs'),
        orderBy('timestamp', 'desc'),
        limit(LOGS_PER_PAGE)
      );

      const snapshot = await getDocs(logsQuery);
      const securityLogs = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        timestamp: doc.data().timestamp.toDate().toLocaleString()
      }));

      setLastVisible(snapshot.docs[snapshot.docs.length - 1]);
      setLogs(securityLogs);
    } catch (error) {
      console.error('Error fetching security logs:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadMoreLogs = async () => {
    if (!lastVisible) return;

    try {
      const logsQuery = query(
        collection(db, 'securityLogs'),
        orderBy('timestamp', 'desc'),
        startAfter(lastVisible),
        limit(LOGS_PER_PAGE)
      );

      const snapshot = await getDocs(logsQuery);
      const moreLogs = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        timestamp: doc.data().timestamp.toDate().toLocaleString()
      }));

      setLastVisible(snapshot.docs[snapshot.docs.length - 1]);
      setLogs(prevLogs => [...prevLogs, ...moreLogs]);
    } catch (error) {
      console.error('Error loading more logs:', error);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  const getActionColor = (action) => {
    switch (action) {
      case 'LOGIN_FAILED':
        return 'error';
      case 'SIGNUP_FAILED':
        return 'error';
      case 'LOGIN':
        return 'success';
      default:
        return 'default';
    }
  };

  const formatDetails = (details) => {
    if (!details) return '';
    
    if (details.error) {
      return (
        <Box>
          <Typography color="error" variant="body2">
            Error: {details.error}
          </Typography>
          {details.attemptedEmail && (
            <Typography variant="body2">
              Attempted Email: {details.attemptedEmail}
            </Typography>
          )}
          {details.timestamp && (
            <Typography variant="body2" color="textSecondary">
              Time: {new Date(details.timestamp).toLocaleString()}
            </Typography>
          )}
        </Box>
      );
    }
    
    return JSON.stringify(details);
  };

  if (loading) {
    return <CircularProgress />;
  }

  return (
    <Paper sx={{ width: '100%', overflow: 'hidden' }}>
      <Box sx={{ p: 2 }}>
        <Typography variant="h6" sx={{ mb: 2 }}>Security Logs</Typography>
      </Box>
      <TableContainer sx={{ maxHeight: 600 }}>
        <Table stickyHeader>
          <TableHead>
            <TableRow>
              <TableCell>Timestamp</TableCell>
              <TableCell>User Email</TableCell>
              <TableCell>Action</TableCell>
              <TableCell>Resource</TableCell>
              <TableCell>Details</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {logs.map((log) => (
              <TableRow 
                key={log.id}
                sx={{
                  backgroundColor: log.action.includes('FAILED') ? 'rgba(255, 0, 0, 0.05)' : 'inherit'
                }}
              >
                <TableCell>{log.timestamp}</TableCell>
                <TableCell>{log.email}</TableCell>
                <TableCell>
                  <Chip 
                    label={log.action}
                    color={getActionColor(log.action)}
                    size="small"
                  />
                </TableCell>
                <TableCell>{log.resource}</TableCell>
                <TableCell>{formatDetails(log.details)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Paper>
  );
};

export default SecurityLogs;