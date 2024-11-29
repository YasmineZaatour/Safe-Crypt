import React, { useState, useEffect } from 'react';
import { Grid, Paper, Typography, Box, CircularProgress } from '@mui/material';
import { Line, Bar, Pie } from 'react-chartjs-2';
import { collection, query, getDocs, where, orderBy } from 'firebase/firestore';
import { db } from '../../firebase';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

const DashboardStats = () => {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalUsers: 0,
    encryptedMessages: 0,
    decryptedMessages: 0,
    userGrowth: [],
    activeUsers: [],
    algorithmUsage: { aes: 0, caesar: 0 }
  });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        // Fetch users
        const usersQuery = query(collection(db, 'users'));
        const usersSnapshot = await getDocs(usersQuery);
        const totalUsers = usersSnapshot.size;

        // Fetch encryption logs for the last 30 days
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        
        const logsQuery = query(
          collection(db, 'encryptionLogs'),
          where('timestamp', '>=', thirtyDaysAgo),
          orderBy('timestamp', 'desc')
        );
        const logsSnapshot = await getDocs(logsQuery);
        
        // Process logs
        let encrypted = 0;
        let decrypted = 0;
        let aesCount = 0;
        let caesarCount = 0;
        
        const userGrowthMap = new Map();
        const activeUsersMap = new Map();

        logsSnapshot.forEach(doc => {
          const log = doc.data();
          
          // Count encryptions/decryptions
          if (log.operation === 'encrypt') encrypted++;
          if (log.operation === 'decrypt') decrypted++;
          
          // Update algorithm usage counting
          if (log.algorithm === 'aes') {
            aesCount++;
          } else if (log.algorithm === 'caesar') {
            caesarCount++;
          }
          
          // Process user growth (by date)
          const date = new Date(log.timestamp.toDate()).toISOString().split('T')[0];
          userGrowthMap.set(date, (userGrowthMap.get(date) || 0) + 1);
          
          // Process active users (by day of week)
          const dayOfWeek = new Date(log.timestamp.toDate()).toLocaleString('en-US', { weekday: 'short' });
          activeUsersMap.set(dayOfWeek, (activeUsersMap.get(dayOfWeek) || 0) + 1);
        });

        // Ensure we're setting all stats
        setStats(prevStats => ({
          ...prevStats,
          totalUsers,
          encryptedMessages: encrypted,
          decryptedMessages: decrypted,
          userGrowth: Array.from(userGrowthMap).slice(-30), // Last 30 days
          activeUsers: Array.from(activeUsersMap),
          algorithmUsage: { aes: aesCount, caesar: caesarCount }
        }));

      } catch (error) {
        console.error('Error fetching stats:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
    // Set up real-time listener for updates
    const interval = setInterval(fetchStats, 60000); // Refresh every minute
    return () => clearInterval(interval);
  }, []);

  const userGrowthData = {
    labels: stats.userGrowth.map(([date]) => date),
    datasets: [{
      label: 'User Growth',
      data: stats.userGrowth.map(([, count]) => count),
      borderColor: 'rgb(75, 192, 192)',
      tension: 0.1
    }]
  };

  const activeUsersData = {
    labels: stats.activeUsers.map(([day]) => day),
    datasets: [{
      label: 'Active Users',
      data: stats.activeUsers.map(([, count]) => count),
      backgroundColor: 'rgba(54, 162, 235, 0.5)',
    }]
  };

  const algorithmUsageData = {
    labels: ['AES', 'Caesar Cipher'],
    datasets: [{
      data: [stats.algorithmUsage.aes, stats.algorithmUsage.caesar],
      backgroundColor: ['rgba(255, 99, 132, 0.5)', 'rgba(54, 162, 235, 0.5)'],
    }]
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Grid container spacing={3}>
      <Grid item xs={12} md={4}>
        <Paper elevation={3} sx={{ p: 2 }}>
          <Typography variant="h6">Total Users</Typography>
          <Typography variant="h4">{stats.totalUsers}</Typography>
        </Paper>
      </Grid>
      <Grid item xs={12} md={4}>
        <Paper elevation={3} sx={{ p: 2 }}>
          <Typography variant="h6">Encrypted Messages</Typography>
          <Typography variant="h4">{stats.encryptedMessages}</Typography>
        </Paper>
      </Grid>
      <Grid item xs={12} md={4}>
        <Paper elevation={3} sx={{ p: 2 }}>
          <Typography variant="h6">Decrypted Messages</Typography>
          <Typography variant="h4">{stats.decryptedMessages}</Typography>
        </Paper>
      </Grid>
      
      <Grid item xs={12} md={6}>
        <Paper elevation={3} sx={{ p: 2 }}>
          <Typography variant="h6">User Growth</Typography>
          <Line data={userGrowthData} />
        </Paper>
      </Grid>
      
      <Grid item xs={12} md={6}>
        <Paper elevation={3} sx={{ p: 2 }}>
          <Typography variant="h6">Active Users</Typography>
          <Bar data={activeUsersData} />
        </Paper>
      </Grid>
      
      <Grid item xs={12} md={6}>
        <Paper elevation={3} sx={{ p: 2 }}>
          <Typography variant="h6">Algorithm Usage</Typography>
          <Pie data={algorithmUsageData} />
        </Paper>
      </Grid>
    </Grid>
  );
};

export default DashboardStats;