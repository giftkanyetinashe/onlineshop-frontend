// src/pages/OrderConfirmationPage.jsx
import React from 'react';
import { useLocation, useParams, Link as RouterLink } from 'react-router-dom';
import { Container, Typography, Paper, Box, Divider, Button } from '@mui/material';
import { useCart } from '../context/CartContext';

const OrderConfirmationPage = () => {
  const { orderNumber } = useParams();
  const location = useLocation();
  const { clearCart } = useCart();
  const order = location.state?.order;

  // Clear the cart when this page loads successfully
  React.useEffect(() => {
    clearCart();
  }, [clearCart]);

  if (!order) {
    return (
      <Container maxWidth="sm" sx={{ my: 8, textAlign: 'center' }}>
        <Typography variant="h4" gutterBottom>Thank You!</Typography>
        <Typography>Your order has been received. Please check your email for details.</Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth="md" sx={{ my: 6 }}>
      <Paper sx={{ p: { xs: 3, sm: 5 } }}>
        <Typography variant="h4" component="h1" gutterBottom sx={{ fontFamily: "'Laginchy', serif", textAlign: 'center' }}>
          Thank You. Your Order is On Hold.
        </Typography>
        <Typography color="text.secondary" textAlign="center" sx={{ mb: 4 }}>
          Please complete payment to process your order. Your order number is <strong>{orderNumber}</strong>.
        </Typography>
        <Divider sx={{ my: 3 }} />
        <Box>
          <Typography variant="h6" gutterBottom>Our Bank Details</Typography>
          <Typography><strong>Bank Name:</strong> First National Bank</Typography>
          <Typography><strong>Account Name:</strong> NuaréSkyn (Pty) Ltd</Typography>
          <Typography><strong>Account Number:</strong> 1234567890</Typography>
          <Typography><strong>Branch Code:</strong> 123456</Typography>
        </Box>
        <Divider sx={{ my: 3 }} />
        <Box>
          <Typography variant="h6" gutterBottom>Important</Typography>
          <Typography color="error.main" fontWeight="bold">
            Please use your Order Number ({orderNumber}) as the payment reference.
          </Typography>
          <Typography color="text.secondary" sx={{ mt: 1 }}>
            Your order will not be shipped until the funds have cleared in our account. An email confirmation will be sent once payment is received.
          </Typography>
        </Box>
        <Box textAlign="center" mt={5}>
          <Button component={RouterLink} to="/products" variant="contained">
            Continue Shopping
          </Button>
        </Box>
      </Paper>
    </Container>
  );
};

export default OrderConfirmationPage;