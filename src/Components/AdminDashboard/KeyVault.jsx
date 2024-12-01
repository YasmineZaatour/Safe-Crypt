import React, { useState, useEffect } from 'react';
import {
  Box, Typography, Button, Dialog, DialogTitle, DialogContent,
  DialogActions, TextField, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Paper, IconButton, Tooltip, CircularProgress
} from '@mui/material';
import { Add as AddIcon, Visibility as VisibilityIcon, Delete as DeleteIcon } from '@mui/icons-material';
import { collection, addDoc, query, orderBy, getDocs, deleteDoc, doc, updateDoc } from 'firebase/firestore';
import { db } from '../../firebase';
import { encryptSecret, decryptSecret } from '../../utils/encryption';

const KeyVault = () => {
  const [secrets, setSecrets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);
  const [formData, setFormData] = useState({ name: '', value: '' });
  const [viewSecretDialog, setViewSecretDialog] = useState(false);
  const [selectedSecret, setSelectedSecret] = useState(null);
  const [decryptedValue, setDecryptedValue] = useState('');

  const fetchSecrets = async () => {
    try {
      const secretsQuery = query(collection(db, 'secrets'), orderBy('createdAt', 'desc'));
      const snapshot = await getDocs(secretsQuery);
      const secretsList = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt.toDate().toLocaleString(),
        lastAccessed: doc.data().lastAccessed ? doc.data().lastAccessed.toDate().toLocaleString() : 'Never'
      }));
      setSecrets(secretsList);
    } catch (error) {
      console.error('Error fetching secrets:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSecrets();
  }, []);

  const handleAddSecret = async () => {
    try {
      const encryptedValue = encryptSecret(formData.value);
      await addDoc(collection(db, 'secrets'), {
        name: formData.name,
        value: encryptedValue,
        createdAt: new Date(),
        lastAccessed: new Date()
      });
      setOpenDialog(false);
      setFormData({ name: '', value: '' });
      fetchSecrets();
    } catch (error) {
      console.error('Error adding secret:', error);
    }
  };

  const handleViewSecret = async (secret) => {
    try {
      const decrypted = decryptSecret(secret.value);
      setDecryptedValue(decrypted);
      setSelectedSecret(secret);
      setViewSecretDialog(true);

      // Update last accessed timestamp
      await updateDoc(doc(db, 'secrets', secret.id), {
        lastAccessed: new Date()
      });
    } catch (error) {
      console.error('Error decrypting secret:', error);
    }
  };

  const handleDeleteSecret = async (secretId) => {
    try {
      await deleteDoc(doc(db, 'secrets', secretId));
      fetchSecrets();
    } catch (error) {
      console.error('Error deleting secret:', error);
    }
  };

  if (loading) return <CircularProgress />;

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
        <Typography variant="h6">Key Vault</Typography>
        <Button
          startIcon={<AddIcon />}
          variant="contained"
          onClick={() => setOpenDialog(true)}
        >
          Add Secret
        </Button>
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell>Created At</TableCell>
              <TableCell>Last Accessed</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {secrets.map((secret) => (
              <TableRow key={secret.id}>
                <TableCell>{secret.name}</TableCell>
                <TableCell>{secret.createdAt}</TableCell>
                <TableCell>{secret.lastAccessed}</TableCell>
                <TableCell>
                  <Tooltip title="View Secret">
                    <IconButton onClick={() => handleViewSecret(secret)}>
                      <VisibilityIcon />
                    </IconButton>
                  </Tooltip>
                  <IconButton onClick={() => handleDeleteSecret(secret.id)}>
                    <DeleteIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Add View Secret Dialog */}
      <Dialog 
        open={viewSecretDialog} 
        onClose={() => setViewSecretDialog(false)}
      >
        <DialogTitle>Secret Details</DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2 }}>
            <Typography variant="subtitle2">Name:</Typography>
            <Typography>{selectedSecret?.name}</Typography>
            
            <Typography variant="subtitle2" sx={{ mt: 2 }}>Value:</Typography>
            <Typography 
              sx={{ 
                backgroundColor: '#f5f5f5', 
                p: 2, 
                borderRadius: 1,
                wordBreak: 'break-all'
              }}
            >
              {decryptedValue}
            </Typography>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setViewSecretDialog(false)}>Close</Button>
        </DialogActions>
      </Dialog>

      <Dialog open={openDialog} onClose={() => setOpenDialog(false)}>
        <DialogTitle>Add New Secret</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Secret Name"
            fullWidth
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          />
          <TextField
            margin="dense"
            label="Secret Value"
            fullWidth
            value={formData.value}
            onChange={(e) => setFormData({ ...formData, value: e.target.value })}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
          <Button onClick={handleAddSecret}>Add</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default KeyVault;