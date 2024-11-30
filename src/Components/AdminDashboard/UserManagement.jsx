import React, { useState, useEffect } from 'react';
import { collection, query, getDocs, deleteDoc, doc, setDoc, updateDoc } from 'firebase/firestore';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { auth, db } from '../../firebase';
import logSecurityEvent from '../../utils/securityLogger';
import {
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Paper, Button, Dialog, DialogTitle, DialogContent, DialogActions,
  TextField, Select, MenuItem, FormControl, InputLabel, CircularProgress
} from '@mui/material';

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);
  const [newUser, setNewUser] = useState({ email: '', role: 'user', password: '' });

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const usersQuery = query(collection(db, 'users'));
      const querySnapshot = await getDocs(usersQuery);
      const usersList = querySnapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          lastLogin: data.lastLogin 
            ? new Date(data.lastLogin.toDate()).toLocaleString()
            : 'Never'
        };
      });
      setUsers(usersList);
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddUser = async () => {
    try {
      // Create authentication user
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        newUser.email,
        newUser.password
      );

      await setDoc(doc(db, 'users', userCredential.user.uid), {
        email: newUser.email,
        role: newUser.role,
        status: 'active',
        createdAt: new Date()
      });

      // Log user creation
      await logSecurityEvent({
        userId: auth.currentUser?.uid,
        email: auth.currentUser?.email,
        action: 'USER_CREATED',
        resource: 'User Management',
        details: {
          newUserEmail: newUser.email,
          newUserRole: newUser.role,
          newUserId: userCredential.user.uid
        }
      });

      setOpenDialog(false);
      fetchUsers();
      setNewUser({ email: '', role: 'user', password: '' });
    } catch (error) {
      console.error('Error adding user:', error);
      alert('Error adding user: ' + error.message);
    }
  };

  const handleDeleteUser = async (userId, userEmail) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      try {
        await deleteDoc(doc(db, 'users', userId));
        
        // Log user deletion
        await logSecurityEvent({
          userId: auth.currentUser?.uid,
          email: auth.currentUser?.email,
          action: 'USER_DELETED',
          resource: 'User Management',
          details: {
            deletedUserId: userId,
            deletedUserEmail: userEmail
          }
        });

        fetchUsers(); // Refresh user list
      } catch (error) {
        console.error('Error deleting user:', error);
        alert('Error deleting user: ' + error.message);
      }
    }
  };

  const handleUpdateUserRole = async (userId, newRole) => {
    try {
      await updateDoc(doc(db, 'users', userId), {
        role: newRole
      });
      await logSecurityEvent({
        userId: auth.currentUser?.uid,
        email: auth.currentUser?.email,
        action: 'UPDATE_USER_ROLE',
        resource: 'User Management',
        details: { targetUserId: userId, newRole }
      });
      fetchUsers(); // Refresh user list
    } catch (error) {
      console.error('Error updating user role:', error);
      alert('Error updating user role: ' + error.message);
    }
  };

  const handleUpdateUserStatus = async (userId, newStatus) => {
    try {
      await updateDoc(doc(db, 'users', userId), {
        status: newStatus
      });
      await logSecurityEvent({
        userId: auth.currentUser?.uid,
        email: auth.currentUser?.email,
        action: 'UPDATE_USER_STATUS',
        resource: 'User Management',
        details: { targetUserId: userId, newStatus }
      });
      fetchUsers();
    } catch (error) {
      console.error('Error updating user status:', error);
      alert('Error updating user status: ' + error.message);
    }
  };

  const handleVerifyUser = async (userId, userEmail, newVerificationStatus) => {
    try {
      await updateDoc(doc(db, 'users', userId), {
        verified: newVerificationStatus
      });

      // Log verification status change
      await logSecurityEvent({
        userId: auth.currentUser?.uid,
        email: auth.currentUser?.email,
        action: newVerificationStatus ? 'USER_VERIFIED' : 'USER_UNVERIFIED',
        resource: 'User Management',
        details: {
          targetUserId: userId,
          targetUserEmail: userEmail,
          newStatus: newVerificationStatus
        }
      });

      fetchUsers();
    } catch (error) {
      console.error('Error updating user verification:', error);
      alert('Error updating user verification status: ' + error.message);
    }
  };

  if (loading) {
    return <CircularProgress />;
  }

  return (
    <Paper sx={{ width: '100%', overflow: 'hidden' }}>
      <Button
        variant="contained"
        color="primary"
        onClick={() => setOpenDialog(true)}
        sx={{ m: 2 }}
      >
        Add New User
      </Button>

      <TableContainer>
        <Table stickyHeader>
          <TableHead>
            <TableRow>
              <TableCell>Email</TableCell>
              <TableCell>Role</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Verified</TableCell>
              <TableCell>Last Login</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {users.map((user) => (
              <TableRow key={user.id}>
                <TableCell>{user.email}</TableCell>
                <TableCell>
                  <Select
                    value={user.role}
                    size="small"
                    onChange={(e) => handleUpdateUserRole(user.id, e.target.value)}
                  >
                    <MenuItem value="admin">Admin</MenuItem>
                    <MenuItem value="user">User</MenuItem>
                  </Select>
                </TableCell>
                <TableCell>
                  <Select
                    value={user.status || 'active'}
                    size="small"
                    onChange={(e) => handleUpdateUserStatus(user.id, e.target.value)}
                  >
                    <MenuItem value="active">Active</MenuItem>
                    <MenuItem value="suspended">Suspended</MenuItem>
                    <MenuItem value="inactive">Inactive</MenuItem>
                  </Select>
                </TableCell>
                <TableCell>
                  <Button
                    variant={user.verified ? "contained" : "outlined"}
                    color={user.verified ? "success" : "warning"}
                    size="small"
                    onClick={() => handleVerifyUser(user.id, user.email, !user.verified)}
                  >
                    {user.verified ? "Verified" : "Verify User"}
                  </Button>
                </TableCell>
                <TableCell>{user.lastLogin}</TableCell>
                <TableCell>
                  <Button 
                    color="error" 
                    size="small"
                    onClick={() => handleDeleteUser(user.id, user.email)}
                  >
                    Delete
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={openDialog} onClose={() => setOpenDialog(false)}>
        <DialogTitle>Add New User</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Email"
            type="email"
            fullWidth
            value={newUser.email}
            onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
          />
          <FormControl fullWidth sx={{ mt: 2 }}>
            <InputLabel>Role</InputLabel>
            <Select
              value={newUser.role}
              onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}
            >
              <MenuItem value="admin">Admin</MenuItem>
              <MenuItem value="user">User</MenuItem>
            </Select>
          </FormControl>
          <TextField
            margin="dense"
            label="Password"
            type="password"
            fullWidth
            value={newUser.password}
            onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
          <Button onClick={handleAddUser}>Add</Button>
        </DialogActions>
      </Dialog>
    </Paper>
  );
};

export default UserManagement;