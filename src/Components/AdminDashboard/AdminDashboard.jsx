import React, { useState } from 'react';
import { Box, Tab, Tabs, Typography, Paper, Container, Button } from '@mui/material';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { signOut } from 'firebase/auth';
import { auth } from '../../firebase';
import UserManagement from './UserManagement';
import SecurityLogs from './SecurityLogs';
import DashboardStats from './DashboardStats';
import KeyVault from './KeyVault';

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState(0);
  const navigate = useNavigate();

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate('/signin');
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  return (
    <Container maxWidth="xl">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Box sx={{ my: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h4" component="h1" gutterBottom>
            Admin Dashboard
          </Typography>
          <Button 
            variant="contained" 
            color="error" 
            onClick={handleLogout}
            sx={{ zIndex: 1000 }}
          >
            Logout
          </Button>
        </Box>
        
        <Paper elevation={3} sx={{ mt: 3 }}>
          <Tabs
            value={activeTab}
            onChange={handleTabChange}
            indicatorColor="primary"
            textColor="primary"
            sx={{ borderBottom: 1, borderColor: 'divider' }}
          >
            <Tab label="Dashboard Overview" />
            <Tab label="User Management" />
            <Tab label="Security Logs" />
            <Tab label="Key Vault" />
          </Tabs>

          <Box sx={{ p: 3 }}>
            {activeTab === 0 && <DashboardStats />}
            {activeTab === 1 && <UserManagement />}
            {activeTab === 2 && <SecurityLogs />}
            {activeTab === 3 && <KeyVault />}
          </Box>
        </Paper>
      </motion.div>
    </Container>
  );
};

export default AdminDashboard;