
import React from 'react';
import { Box, Paper, Typography, CircularProgress } from '@mui/material';
import { motion } from 'framer-motion';

const WaitingVerification = () => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="80vh"
      >
        <Paper
          elevation={3}
          sx={{
            p: 4,
            textAlign: 'center',
            maxWidth: 400,
          }}
        >
          <CircularProgress sx={{ mb: 2 }} />
          <Typography variant="h5" gutterBottom>
            Account Pending Verification
          </Typography>
          <Typography color="text.secondary">
            Your account is currently under review. Please wait for an administrator to verify your account. You will be able to access the encryption interface once your account is verified.
          </Typography>
        </Paper>
      </Box>
    </motion.div>
  );
};

export default WaitingVerification;