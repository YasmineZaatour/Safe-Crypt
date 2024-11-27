
import React from 'react';
import { Grid, Paper, Typography, Box } from '@mui/material';
import { Line, Bar, Pie } from 'react-chartjs-2';
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
  const userGrowthData = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
    datasets: [{
      label: 'User Growth',
      data: [12, 19, 25, 32, 45, 56],
      borderColor: 'rgb(75, 192, 192)',
      tension: 0.1
    }]
  };

  const activeUsersData = {
    labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    datasets: [{
      label: 'Active Users',
      data: [65, 59, 80, 81, 56, 55, 40],
      backgroundColor: 'rgba(54, 162, 235, 0.5)',
    }]
  };

  const algorithmUsageData = {
    labels: ['AES', 'Caesar Cipher'],
    datasets: [{
      data: [300, 200],
      backgroundColor: ['rgba(255, 99, 132, 0.5)', 'rgba(54, 162, 235, 0.5)'],
    }]
  };

  return (
    <Grid container spacing={3}>
      <Grid item xs={12} md={4}>
        <Paper elevation={3} sx={{ p: 2 }}>
          <Typography variant="h6">Total Users</Typography>
          <Typography variant="h4">156</Typography>
        </Paper>
      </Grid>
      <Grid item xs={12} md={4}>
        <Paper elevation={3} sx={{ p: 2 }}>
          <Typography variant="h6">Encrypted Messages</Typography>
          <Typography variant="h4">328</Typography>
        </Paper>
      </Grid>
      <Grid item xs={12} md={4}>
        <Paper elevation={3} sx={{ p: 2 }}>
          <Typography variant="h6">Decrypted Messages</Typography>
          <Typography variant="h4">295</Typography>
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