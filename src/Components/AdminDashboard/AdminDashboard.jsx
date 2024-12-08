import React, { useState } from 'react';
import { Box, Tab, Tabs, Typography, Paper, Container } from '@mui/material';
import { motion } from 'framer-motion';
import UserManagement from './UserManagement';
import SecurityLogs from './SecurityLogs';
import DashboardStats from './DashboardStats';
import KeyVault from './KeyVault';

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState(0);

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  return (
    <Container maxWidth="xl">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Box sx={{ my: 4 }}>
          <Typography variant="h4" component="h1" gutterBottom>
            Admin Dashboard
          </Typography>
          
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
        </Box>
      </motion.div>
    </Container>
  );
};

export default AdminDashboard;