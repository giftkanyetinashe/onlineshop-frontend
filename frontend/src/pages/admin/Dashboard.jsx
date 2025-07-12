import React, { useState, useEffect } from 'react';
import { 
  Container, 
  Typography, 
  Box, 
  Card, 
  CardContent, 
  Grid,
  CircularProgress,
  Alert,
  Button,
  Stack
} from '@mui/material';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const AdminDashboard = () => {
  const [stats, setStats] = useState({ productCount: 0, orderCount: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (authLoading) {
      return;
    }

    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    if (!user?.is_staff) {
      navigate('/');
      return;
    }

    const fetchData = async () => {
      try {
        const endpoints = [
          { url: '/products/products/', key: 'productCount' },
          { url: '/orders/orders/', key: 'orderCount' }
        ];

        const results = await Promise.all(
          endpoints.map(endpoint => api.get(endpoint.url))
        );

        const newStats = {};
        endpoints.forEach((endpoint, index) => {
          const response = results[index];
          newStats[endpoint.key] = response.data.count || response.data.length || 0;
        });

        setStats(newStats);
      } catch (err) {
        setError(err.message || 'Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [authLoading, isAuthenticated, user, navigate]);

  if (authLoading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Container>
        <Alert severity="error" sx={{ mt: 3 }}>
          {error}
        </Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg">
      <Box my={4}>
        <Typography variant="h4" component="h1" gutterBottom>
          Admin Dashboard
        </Typography>

        {/* Navigation Buttons */}
        <Stack direction="row" spacing={2} mb={4}>
          <Button variant="contained" component={Link} to="/admin/dashboard">
            Dashboard Home
          </Button>
          <Button variant="contained" component={Link} to="/admin/products">
            Manage Products
          </Button>
          <Button variant="contained" component={Link} to="/admin/orders">
            Manage Orders
          </Button>
          <Button variant="contained" component={Link} to="/admin/banner">
            Manage Banners
          </Button>
        </Stack>

        <Typography>
          Welcome to the admin dashboard. Use the links above to manage products, orders, and banners.
        </Typography>

        {loading ? (
          <Box display="flex" justifyContent="center">
            <CircularProgress />
          </Box>
        ) : (
          <Grid container spacing={3} mt={4}>
            <Grid item xs={12} sm={6}>
              <Card>
                <CardContent>
                  <Typography variant="h6" color="textSecondary">
                    Total Products
                  </Typography>
                  <Typography variant="h3">
                    {stats.productCount}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Card>
                <CardContent>
                  <Typography variant="h6" color="textSecondary">
                    Total Orders
                  </Typography>
                  <Typography variant="h3">
                    {stats.orderCount}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        )}
      </Box>
    </Container>
  );
};

export default AdminDashboard;
