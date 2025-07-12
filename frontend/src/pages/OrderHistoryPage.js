// src/pages/profile/OrderHistoryPage.js

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Container, Typography, Box, Alert,
  Accordion, AccordionSummary, AccordionDetails, Chip, Grid,
  List, ListItem, ListItemText, ListItemAvatar, Avatar, Divider, Button, Skeleton
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ShoppingBagIcon from '@mui/icons-material/ShoppingBag';
import { format } from 'date-fns';
import api from '../services/api'; // Your configured axios instance

// A map to style the status chips based on the status code from the backend
const statusMap = {
  P: { label: 'Pending', color: 'warning' },
  PR: { label: 'Processing', color: 'info' },
  S: { label: 'Shipped', color: 'primary' },
  D: { label: 'Delivered', color: 'success' },
  C: { label: 'Cancelled', color: 'error' },
};

// Skeleton loader for a better loading experience
const OrderSkeleton = () => (
  <Box sx={{ mb: 2 }}>
    <Skeleton variant="rectangular" height={64} />
    <Skeleton />
    <Skeleton width="60%" />
  </Box>
);

const OrderHistoryPage = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setLoading(true);
        const response = await api.get('/orders/my-orders/');
        setOrders(response.data);
        setError('');
      } catch (err) {
        console.error("Failed to fetch orders:", err);
        setError("We couldn't load your order history. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  const renderContent = () => {
    if (loading) {
      return (
        <>
          <OrderSkeleton />
          <OrderSkeleton />
          <OrderSkeleton />
        </>
      );
    }

    if (error) {
      return <Alert severity="error">{error}</Alert>;
    }

    if (orders.length === 0) {
      return (
        <Box textAlign="center" py={5}>
          <ShoppingBagIcon sx={{ fontSize: 80, color: 'grey.400', mb: 2 }} />
          <Typography variant="h5" gutterBottom>No Orders Yet</Typography>
          <Typography color="text.secondary">You haven't placed any orders with us.</Typography>
          <Button component={Link} to="/products" variant="contained" sx={{ mt: 3 }}>
            Start Shopping
          </Button>
        </Box>
      );
    }

    return orders.map((order) => (
      <Accordion key={order.id} sx={{ mb: 2, '&:before': { display: 'none' } }}>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} sm={3}>
              <Typography variant="body2" color="text.secondary">ORDER #{order.order_number}</Typography>
            </Grid>
            <Grid item xs={6} sm={3}>
              <Typography variant="body2" color="text.secondary">{format(new Date(order.created_at), 'MMMM d, yyyy')}</Typography>
            </Grid>
            <Grid item xs={6} sm={3}>
              <Typography variant="body1" fontWeight="bold">${Number(order.total_price).toFixed(2)}</Typography>
            </Grid>
            <Grid item xs={12} sm={3}>
              <Chip 
                label={statusMap[order.status]?.label || 'Unknown'} 
                color={statusMap[order.status]?.color || 'default'}
                size="small"
              />
            </Grid>
          </Grid>
        </AccordionSummary>
        <AccordionDetails sx={{ backgroundColor: 'grey.50', p: 3 }}>
          <Typography variant="h6" gutterBottom>Order Items</Typography>
          <List disablePadding>
            {order.items.map((item, index) => (
              <React.Fragment key={item.id}>
                <ListItem disableGutters>
                  <ListItemAvatar>
                    <Avatar variant="rounded" src={item.variant.product_image} />
                  </ListItemAvatar>
                  <ListItemText
                    primary={`${item.variant.product_name} (${item.variant.size}, ${item.variant.color})`}
                    secondary={`Quantity: ${item.quantity}`}
                  />
                  <Typography variant="body1" fontWeight="medium">
                    ${Number(item.price).toFixed(2)}
                  </Typography>
                </ListItem>
                {index < order.items.length - 1 && <Divider component="li" />}
              </React.Fragment>
            ))}
          </List>
          <Divider sx={{ my: 2 }} />
          <Box display="flex" justifyContent="space-between" alignItems="center">
             <Typography variant="body2" color={order.payment_status ? "success.main" : "error.main"}>
                {order.payment_status ? 'Payment Confirmed' : 'Payment Pending'}
             </Typography>
             <Typography variant="h6">
                Total: ${Number(order.total_price).toFixed(2)}
             </Typography>
          </Box>
        </AccordionDetails>
      </Accordion>
    ));
  };

  return (
    <Container maxWidth="lg" sx={{ my: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        My Orders
      </Typography>
      {renderContent()}
    </Container>
  );
};

export default OrderHistoryPage;