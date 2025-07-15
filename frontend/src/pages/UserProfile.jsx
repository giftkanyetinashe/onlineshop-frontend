import React, { useState, useEffect } from 'react';
import { 
  Container, Box, Typography, TextField, Button, Avatar, Grid, Paper,
  Alert, CircularProgress, Tabs, Tab, Divider, Fade, Stack
} from '@mui/material';
import PhotoCamera from '@mui/icons-material/PhotoCamera';
import CheckIcon from '@mui/icons-material/Check';
import { AnimatePresence, motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

// Helper component to create tab panels
const TabPanel = (props) => {
  const { children, value, index, ...other } = props;
  return (
    <div role="tabpanel" hidden={value !== index} {...other}>
      {value === index && <Box sx={{ pt: 4 }}>{children}</Box>}
    </div>
  );
};

const UserProfilePage = () => {
  const { user, updateUser } = useAuth();
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    country: '',
    postalCode: '',
    avatar: null,
  });
  const [loading, setLoading] = useState(true);
  const [saveState, setSaveState] = useState('idle');
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState(0);
  const [avatarHover, setAvatarHover] = useState(false);

  useEffect(() => {
    if (user) {
      setFormData({
        firstName: user.first_name || '',
        lastName: user.last_name || '',
        email: user.email || '',
        phone: user.phone || '',
        address: user.address || '',
        city: user.city || '',
        country: user.country || '',
        postalCode: user.postal_code || '',
        avatar: user.avatar || null
      });
      setLoading(false);
    }
  }, [user]);

  const handleChange = (e) => setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  const handleFileChange = (e) => setFormData(prev => ({ ...prev, avatar: e.target.files[0] }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaveState('saving');
    setError('');
    
    try {
      const formDataToSend = new FormData();
      Object.keys(formData).forEach(key => {
        if (key === 'avatar' && formData.avatar instanceof File) {
            formDataToSend.append('avatar', formData.avatar);
        } else if (key !== 'avatar') {
            const snakeCaseKey = key.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);
            formDataToSend.append(snakeCaseKey, formData[key]);
        }
      });

      const response = await api.patch('/auth/me/', formDataToSend, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      if (updateUser) updateUser(response.data);
      
      setSaveState('success');
      setTimeout(() => setSaveState('idle'), 2000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update profile');
      setSaveState('idle');
    }
  };

  // --- THIS IS THE FIX ---
  // Replaced the invalid comment with the actual loading state JSX.
  if (loading) {
    return (
        <Container>
            <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
                <CircularProgress />
            </Box>
        </Container>
    );
  }

  return (
    <Container maxWidth="lg">
      <Box my={4}>
        <Typography variant="h4" component="h1" gutterBottom>Account Settings</Typography>
        <Divider />
        
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs value={activeTab} onChange={(e, newValue) => setActiveTab(newValue)}>
            <Tab label="My Profile" />
            <Tab label="Order History" disabled />
            <Tab label="Security" disabled />
          </Tabs>
        </Box>

        <TabPanel value={activeTab} index={0}>
          {error && <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError('')}>{error}</Alert>}
          <Grid container spacing={{ xs: 4, md: 6 }}>
            <Grid item xs={12} md={4}>
              <Box sx={{ textAlign: 'center', position: 'sticky', top: '100px' }}>
                <Box 
                  position="relative" display="inline-block"
                  onMouseEnter={() => setAvatarHover(true)}
                  onMouseLeave={() => setAvatarHover(false)}
                >
                  <Avatar
                    alt={user.username}
                    src={formData.avatar instanceof File ? URL.createObjectURL(formData.avatar) : (user.avatar || '')}
                    sx={{ width: 150, height: 150, fontSize: '4rem', border: `2px solid`, borderColor: 'divider' }}
                  >
                    {user.first_name?.[0]}
                  </Avatar>
                  <Fade in={avatarHover}>
                    <Box
                      sx={{
                        position: 'absolute', top: 0, left: 0, width: '100%', height: '100%',
                        bgcolor: 'rgba(0,0,0,0.5)', borderRadius: '50%',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        cursor: 'pointer'
                      }}
                      component="label"
                      htmlFor="avatar-upload"
                    >
                      <PhotoCamera sx={{ color: 'white' }}/>
                      <input accept="image/*" id="avatar-upload" type="file" hidden onChange={handleFileChange} />
                    </Box>
                  </Fade>
                </Box>
                <Typography variant="h6" mt={2}>{user.first_name} {user.last_name}</Typography>
                <Typography variant="body2" color="text.secondary">Member since {new Date(user.date_joined).toLocaleDateString()}</Typography>
              </Box>
            </Grid>
            
            <Grid item xs={12} md={8}>
              <Paper elevation={0} sx={{ p: { xs: 2, md: 4 }, border: '1px solid', borderColor: 'divider', borderRadius: 2 }}>
                <form onSubmit={handleSubmit}>
                  <Stack spacing={3}>
                    <Box>
                      <Typography variant="h6" gutterBottom>Personal Details</Typography>
                      <Grid container spacing={2}>
                        <Grid item xs={12} sm={6}><TextField fullWidth label="First Name" name="firstName" value={formData.firstName} onChange={handleChange} required /></Grid>
                        <Grid item xs={12} sm={6}><TextField fullWidth label="Last Name" name="lastName" value={formData.lastName} onChange={handleChange} required /></Grid>
                        <Grid item xs={12} sm={6}><TextField fullWidth label="Email" name="email" type="email" value={formData.email} onChange={handleChange} required /></Grid>
                        <Grid item xs={12} sm={6}><TextField fullWidth label="Phone" name="phone" value={formData.phone} onChange={handleChange} /></Grid>
                      </Grid>
                    </Box>
                    <Divider />
                    <Box>
                      <Typography variant="h6" gutterBottom>Shipping Address</Typography>
                      <Grid container spacing={2}>
                        <Grid item xs={12}><TextField fullWidth label="Address" name="address" value={formData.address} onChange={handleChange} /></Grid>
                        <Grid item xs={12} sm={4}><TextField fullWidth label="City" name="city" value={formData.city} onChange={handleChange} /></Grid>
                        <Grid item xs={12} sm={4}><TextField fullWidth label="Country" name="country" value={formData.country} onChange={handleChange} /></Grid>
                        <Grid item xs={12} sm={4}><TextField fullWidth label="Postal Code" name="postalCode" value={formData.postalCode} onChange={handleChange} /></Grid>
                      </Grid>
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                      <Button type="submit" variant="contained" color="primary" disabled={saveState === 'saving'} sx={{ mt: 2, minWidth: 140, height: 40 }}>
                        <AnimatePresence mode="wait">
                          {saveState === 'idle' && <motion.div key="idle" initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}}>Save Changes</motion.div>}
                          {saveState === 'saving' && <motion.div key="saving" initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}}><CircularProgress size={24} color="inherit" /></motion.div>}
                          {saveState === 'success' && <motion.div key="success" initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}}><CheckIcon /></motion.div>}
                        </AnimatePresence>
                      </Button>
                    </Box>
                  </Stack>
                </form>
              </Paper>
            </Grid>
          </Grid>
        </TabPanel>
      </Box>
    </Container>
  );
};

export default UserProfilePage;