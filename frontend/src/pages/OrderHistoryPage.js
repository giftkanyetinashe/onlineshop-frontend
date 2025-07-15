import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Container, Typography, Box, Alert,
  Accordion, AccordionSummary, AccordionDetails, Chip, Grid,
  List, ListItem, ListItemText, ListItemAvatar, Avatar, Divider, Button, Skeleton
} from '@mui/material';
import { useTheme, alpha } from '@mui/material/styles';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ShoppingBagIcon from '@mui/icons-material/ShoppingBag';
import { format } from 'date-fns';
import api from '../services/api'; // Your configured axios instance

// This map is now just for labels, as styles will be derived from the theme.
const statusLabels = {
  P: 'Pending',
  PR: 'Processing',
  S: 'Shipped',
  D: 'Delivered',
  C: 'Cancelled',
};

// Skeleton loader component
const OrderSkeleton = () => (
  <Box sx={{ mb: 2 }}>
    <Skeleton 
      variant="rectangular" 
      height={72} 
      sx={{ 
        // This will now work perfectly because `theme.palette.mistyGrey` is defined.
        bgcolor: (theme) => alpha(theme.palette.mistyGrey, 0.4), 
        borderRadius: '4px' 
      }} 
    />
  </Box>
);

const OrderHistoryPage = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const theme = useTheme(); // Access the theme via the hook

  // Derive the status styles from the theme inside the component
  const getStatusStyles = (status) => {
    switch (status) {
      case 'S':
      case 'D':
        return { color: theme.palette.getContrastText(theme.palette.primary.main), bgColor: theme.palette.primary.main };
      case 'C':
        return { color: theme.palette.getContrastText(theme.palette.secondary.main), bgColor: theme.palette.secondary.main };
      case 'P':
      case 'PR':
      default:
        return { color: theme.palette.text.primary, bgColor: theme.palette.mistyGrey };
    }
  };

// In src/pages/profile/OrderHistoryPage.js

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setLoading(true);
        // --- FIX IS HERE: UNCOMMENT THESE TWO LINES ---
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
  }, []); // The empty dependency array is correct here.

  const renderContent = () => {
    if (loading) {
      return <> <OrderSkeleton /> <OrderSkeleton /> <OrderSkeleton /> </>;
    }

    if (error) {
      return <Alert severity="error">{error}</Alert>;
    }

    if (orders.length === 0) {
      return (
        <Box textAlign="center" py={8}>
          <ShoppingBagIcon sx={{ fontSize: 80, color: 'text.secondary', mb: 2 }} />
          <Typography variant="h5" gutterBottom>
            No Orders Yet
          </Typography>
          <Typography color="text.secondary">
            You haven't placed any orders with us yet.
          </Typography>
          <Button component={Link} to="/shop" variant="contained" color="primary" sx={{ mt: 3 }}>
            Start Shopping
          </Button>
        </Box>
      );
    }

    return orders.map((order) => {
      const statusStyle = getStatusStyles(order.status);

      return (
        <Accordion 
          key={order.id}
          disableGutters
          elevation={0}
          sx={{ 
            mb: 1.5, 
            border: `1px solid ${theme.palette.mistyGrey}`,
            borderRadius: '4px',
            '&:before': { display: 'none' },
            backgroundColor: 'transparent',
          }}
        >
          <AccordionSummary expandIcon={<ExpandMoreIcon color="primary" />}>
            <Grid container spacing={2} alignItems="center">
              <Grid item xs={12} sm={4} md={3}>
                <Typography variant="body2" color="text.secondary">ORDER #{order.order_number}</Typography>
              </Grid>
              <Grid item xs={6} sm={4} md={3}>
                <Typography variant="body2" color="text.primary">{format(new Date(order.created_at), 'MMMM d, yyyy')}</Typography>
              </Grid>
              <Grid item xs={6} sm={4} md={3}>
                <Typography variant="body1" sx={{ fontWeight: 500 }}>${Number(order.total_price).toFixed(2)}</Typography>
              </Grid>
              <Grid item xs={12} sm={12} md={3}>
                <Chip 
                  label={statusLabels[order.status] || 'Unknown'} 
                  size="small"
                  sx={{
                    bgcolor: statusStyle.bgColor,
                    color: statusStyle.color,
                    fontFamily: "'Circular Std', sans-serif",
                    fontWeight: 500,
                    borderRadius: '4px',
                  }}
                />
              </Grid>
            </Grid>
          </AccordionSummary>
          <AccordionDetails sx={{ 
            backgroundColor: 'background.paper',
            p: 3, 
            borderTop: `1px solid ${theme.palette.blush}`
          }}>
            <Typography variant="h6" sx={{ mb: 2 }}>Order Items</Typography>
            <List disablePadding>
              {order.items.map((item, index) => (
                <React.Fragment key={item.id}>
                  <ListItem disableGutters>
                    <ListItemAvatar>
                      <Avatar variant="rounded" src={item.variant.product_image} sx={{ borderRadius: '4px', bgcolor: 'blush' }} />
                    </ListItemAvatar>
                    <ListItemText
                      primary={item.variant.product_name}
                      secondary={`Quantity: ${item.quantity}`}
                      primaryTypographyProps={{ fontWeight: 500 }}
                      secondaryTypographyProps={{ color: 'text.secondary' }}
                    />
                    <Typography variant="body1" fontWeight="medium">
                      ${Number(item.price).toFixed(2)}
                    </Typography>
                  </ListItem>
                  {index < order.items.length - 1 && <Divider component="li" sx={{ my: 1.5, borderColor: 'blush' }} />}
                </React.Fragment>
              ))}
            </List>
            <Divider sx={{ my: 2, borderColor: 'mistyGrey' }} />
            <Box display="flex" justifyContent="space-between" alignItems="center">
               <Typography variant="body2" sx={{ color: order.payment_status ? 'text.secondary' : 'error.main' }}>
                  {order.payment_status ? 'Payment Confirmed' : 'Payment Pending'}
               </Typography>
               <Typography variant="h6">
                  Total: ${Number(order.total_price).toFixed(2)}
               </Typography>
            </Box>
          </AccordionDetails>
        </Accordion>
      )
    });
  };

  return (
    <Container maxWidth="lg" sx={{ my: 4, py: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom sx={{ mb: 3 }}>
        Order History
      </Typography>
      {renderContent()}
    </Container>
  );
};

export default OrderHistoryPage;