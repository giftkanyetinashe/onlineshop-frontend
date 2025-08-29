import React, { useState, useEffect, useCallback } from 'react';
import { 
  Container, Box, Typography, TextField, Button, Avatar, Grid, Paper,
  Alert, CircularProgress, Tabs, Tab, Divider, Fade, Stack, Chip
} from '@mui/material';
import PhotoCamera from '@mui/icons-material/PhotoCamera';
import CheckIcon from '@mui/icons-material/Check';
import { AnimatePresence, motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import dayjs from 'dayjs';

const TabPanel = ({ children, value, index }) => (
  <div role="tabpanel" hidden={value !== index}>
    {value === index && <Box sx={{ pt: 4 }}>{children}</Box>}
  </div>
);

const getOrderStatusLabel = (status) => {
    const statusMap = { P: 'Pending', OH: 'On Hold', PR: 'Processing', S: 'Shipped', D: 'Delivered', C: 'Cancelled' };
    return statusMap[status] || 'Unknown';
};

const UserProfilePage = () => {
  const { user, updateUser } = useAuth();
  const [initialData, setInitialData] = useState(null); // --- FIX 1: Store the initial state
  const [formData, setFormData] = useState(null);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [saveState, setSaveState] = useState('idle');
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState(0);

  useEffect(() => {
    // Only set form data and stop loading AFTER the user object is available.
    if (user) {
      const userData = {
        first_name: user.first_name || '',
        last_name: user.last_name || '',
        email: user.email || '',
        phone: user.phone || '',
        address: user.address || '',
        city: user.city || '',
        country: user.country || '',
        postal_code: user.postal_code || '',
        avatar: user.avatar || null,
      };
      setInitialData(userData); // Store a snapshot of the original data
      setFormData(userData);
      setLoading(false);
    }
  }, [user]);

  const fetchOrders = useCallback(async () => {
    if (activeTab === 1 && orders.length === 0) {
      setOrdersLoading(true);
      try {
        const response = await api.get('/orders/my-orders/');
        setOrders(response.data);
      } catch (err) { setError('Could not load order history.'); }
      finally { setOrdersLoading(false); }
    }
  }, [activeTab, orders.length]);

  useEffect(() => { fetchOrders(); }, [fetchOrders]);
  
  const handleChange = (e) => setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  const handleFileChange = (e) => {
    if (e.target.files[0]) {
      setFormData(prev => ({ ...prev, avatar: e.target.files[0] }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaveState('saving');
    setError('');

    try {
      const formDataToSend = new FormData();
      let hasChanges = false;
      
      // --- FIX 2: Compare against initialData, not the live user object ---
      Object.keys(formData).forEach(key => {
        if (key === 'avatar' && formData.avatar instanceof File) {
          formDataToSend.append('avatar', formData.avatar);
          hasChanges = true;
        } else if (key !== 'avatar' && formData[key] !== initialData[key]) {
          formDataToSend.append(key, formData[key]);
          hasChanges = true;
        }
      });

      if (!hasChanges) {
        setSaveState('success');
        setTimeout(() => setSaveState('idle'), 2000);
        return;
      }

      const response = await api.patch('/auth/me/', formDataToSend, { headers: { 'Content-Type': 'multipart/form-data' } });
      
      updateUser(response.data); // Update global user state
      setSaveState('success');
      setTimeout(() => setSaveState('idle'), 2000);

    } catch (err) {
      const errorData = err.response?.data;
      const errorMessage = typeof errorData === 'object' ? Object.values(errorData).flat().join(' ') : 'Failed to update profile.';
      setError(errorMessage);
      setSaveState('idle');
    }
  };

  if (loading || !formData) {
    return <Container><Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh"><CircularProgress /></Box></Container>;
  }

  return (
    <Container maxWidth="lg">
      <Box my={4}>
        <Typography variant="h4" component="h1" gutterBottom sx={{ fontFamily: "'Laginchy', serif" }}>Account Settings</Typography>
        <Divider />
        
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs value={activeTab} onChange={(e, newValue) => setActiveTab(newValue)}>
            <Tab label="My Profile" />
            <Tab label="Order History" />
            <Tab label="Security" disabled />
          </Tabs>
        </Box>

        <TabPanel value={activeTab} index={0}>
          {error && <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError('')}>{error}</Alert>}
          <Grid container spacing={{ xs: 4, md: 6 }}>
            <Grid item xs={12} md={4}>
              <Box sx={{ textAlign: 'center', position: 'sticky', top: '100px' }}>
                <Box position="relative" display="inline-block">
                  <Avatar src={formData.avatar instanceof File ? URL.createObjectURL(formData.avatar) : formData.avatar} sx={{ width: 150, height: 150, fontSize: '4rem', border: `2px solid`, borderColor: 'divider' }}>
                    {formData.first_name?.[0]}
                  </Avatar>
                  <Fade in>
                    <Box sx={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', bgcolor: 'rgba(0,0,0,0.4)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', opacity: 0, '&:hover': { opacity: 1 }, transition: 'opacity 0.2s' }} component="label" htmlFor="avatar-upload">
                      <PhotoCamera sx={{ color: 'white' }}/>
                      <input accept="image/*" id="avatar-upload" type="file" hidden onChange={handleFileChange} />
                    </Box>
                  </Fade>
                </Box>
                <Typography variant="h6" mt={2}>{user.first_name} {user.last_name}</Typography>
                <Typography variant="body2" color="text.secondary">Member since {dayjs(user.date_joined).format('MMMM YYYY')}</Typography>
              </Box>
            </Grid>
            <Grid item xs={12} md={8}>
              <Paper component="form" onSubmit={handleSubmit} elevation={0} sx={{ p: { xs: 2, md: 4 }, border: '1px solid', borderColor: 'divider', borderRadius: 2 }}>
                <Stack spacing={4}>
                  <Box>
                    <Typography variant="h6" gutterBottom>Personal Details</Typography>
                    <Grid container spacing={2}>
                      <Grid item xs={12} sm={6}><TextField fullWidth label="First Name" name="first_name" value={formData.first_name} onChange={handleChange} /></Grid>
                      <Grid item xs={12} sm={6}><TextField fullWidth label="Last Name" name="last_name" value={formData.last_name} onChange={handleChange} /></Grid>
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
                      <Grid item xs={12} sm={4}><TextField fullWidth label="Postal Code" name="postal_code" value={formData.postal_code} onChange={handleChange} /></Grid>
                    </Grid>
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                    <Button type="submit" variant="contained" disabled={saveState === 'saving'} sx={{ mt: 2, minWidth: 140, height: 40, bgcolor: saveState === 'success' ? 'success.main' : 'primary.main', '&:hover': {bgcolor: saveState === 'success' ? 'success.dark' : 'primary.dark'} }}>
                      <AnimatePresence mode="wait">
                        {saveState === 'idle' && <motion.span key="idle">Save Changes</motion.span>}
                        {saveState === 'saving' && <motion.span key="saving"><CircularProgress size={24} color="inherit" /></motion.span>}
                        {saveState === 'success' && <motion.span key="success" style={{display: 'flex', alignItems: 'center'}}><CheckIcon /> Saved</motion.span>}
                      </AnimatePresence>
                    </Button>
                  </Box>
                </Stack>
              </Paper>
            </Grid>
          </Grid>
        </TabPanel>
        <TabPanel value={activeTab} index={1}>
          <Typography variant="h6" gutterBottom>My Order History</Typography>
          {ordersLoading ? <CircularProgress /> : orders.length === 0 ? <Alert severity="info">You have not placed any orders yet.</Alert> : (
            <Stack spacing={2}>
              {orders.map(order => (
                <Paper key={order.id} variant="outlined" sx={{ p: 2, borderRadius: 2 }}>
                  <Stack direction={{xs: 'column', sm: 'row'}} justifyContent="space-between" alignItems={{xs: 'flex-start', sm: 'center'}} spacing={1}>
                    <Box>
                      <Typography variant="body1" fontWeight={500}>Order #{order.order_number}</Typography>
                      <Typography variant="body2" color="text.secondary">Placed on {dayjs(order.created_at).format('D MMMM, YYYY')}</Typography>
                    </Box>
                    <Box textAlign={{xs: 'left', sm: 'right'}}>
                        <Typography variant="body1" fontWeight={500}>${order.total_price}</Typography>
                        <Chip label={getOrderStatusLabel(order.status)} size="small" sx={{ mt: 0.5 }} />
                    </Box>
                  </Stack>
                </Paper>
              ))}
            </Stack>
          )}
        </TabPanel>
      </Box>
    </Container>
  );
};

export default UserProfilePage