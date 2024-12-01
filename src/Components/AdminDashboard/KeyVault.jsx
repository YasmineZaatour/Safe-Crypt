import React, { useState, useEffect } from 'react';
import {
  Box, Typography, Button, Dialog, DialogTitle, DialogContent,
  DialogActions, TextField, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Paper, IconButton, Tooltip, CircularProgress
} from '@mui/material';
import { Add as AddIcon, Visibility as VisibilityIcon, Delete as DeleteIcon } from '@mui/icons-material';
import { collection, addDoc, query, orderBy, getDocs, deleteDoc, doc, updateDoc, getDoc } from 'firebase/firestore';
import { db, auth } from '../../firebase';
import { encryptSecret, decryptSecret } from '../../utils/encryption';
import logActivity from '../../utils/logUtils';

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
    if (!formData.name || !formData.value) {
      console.error('Name and value are required');
      return;
    }

    try {
      const user = auth.currentUser;
      const userDoc = await getDoc(doc(db, 'users', user.uid));
      const userData = userDoc.data();

      if (userData.role !== 'admin') {
        throw new Error('Only admins can create secrets');
      }

      const encryptedValue = encryptSecret(formData.value);
      const docRef = await addDoc(collection(db, 'secrets'), {
        name: formData.name,
        value: encryptedValue,
        createdAt: new Date(),
        lastAccessed: new Date()
      });

      await logActivity(
        'SECRET_CREATED',
        'KeyVault',
        {
          secretName: formData.name,
          secretId: docRef.id
        }
      );

      setOpenDialog(false);
      setFormData({ name: '', value: '' });
      fetchSecrets();
    } catch (error) {
      console.error('Error adding secret:', error);
      await logActivity('SECRET_CREATION_FAILED', 'KeyVault', { error: error.message });
    }
  };

  const handleViewSecret = async (secret) => {
    try {
      const decrypted = decryptSecret(secret.value);
      setDecryptedValue(decrypted);
      setSelectedSecret(secret);
      setViewSecretDialog(true);

      await updateDoc(doc(db, 'secrets', secret.id), {
        lastAccessed: new Date()
      });

      await logActivity(
        'SECRET_ACCESSED',
        'KeyVault',
        {
          secretName: secret.name,
          secretId: secret.id
        }
      );
    } catch (error) {
      console.error('Error decrypting secret:', error);
      await logActivity('SECRET_ACCESS_FAILED', 'KeyVault', { 
        error: error.message,
        secretId: secret.id 
      });
    }
  };

  const handleDeleteSecret = async (secretId) => {
    try {
      const secretToDelete = secrets.find(s => s.id === secretId);
      await deleteDoc(doc(db, 'secrets', secretId));
      
      await logActivity(
        'SECRET_DELETED',
        'KeyVault',
        {
          secretName: secretToDelete.name,
          secretId: secretId
        }
      );

      fetchSecrets();
    } catch (error) {
      console.error('Error deleting secret:', error);
      await logActivity('SECRET_DELETION_FAILED', 'KeyVault', { 
        error: error.message,
        secretId: secretId 
      });
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