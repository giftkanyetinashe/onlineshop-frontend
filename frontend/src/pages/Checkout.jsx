import React, { useState } from 'react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import OrderSummary from './OrderSummary'; 

// Import all necessary components
import {
  Container,
  Typography,
  Box,
  Grid,
  TextField,
  Button,
  FormControlLabel,
  Checkbox,
  Paper,
  CircularProgress,
  Alert,
  Stack,
  useTheme,
  useMediaQuery,
} from '@mui/material';

const Checkout = () => {
  const { cart } = useCart();
  const { user } = useAuth();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  // State, handlers, etc.
  const [shippingAddress, setShippingAddress] = useState(user?.address || '');
  const [billingAddress, setBillingAddress] = useState(user?.address || '');
  const [sameAsShipping, setSameAsShipping] = useState(true);
  const [paymentMethod, setPaymentMethod] = useState('paynow');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // ========================================================
  // THE FIX IS HERE: Re-introducing Math.round()
  // ========================================================
  const getPrice = (item) => {
    const price = Number(item?.variant?.price) || Number(item?.product?.discount_price) || Number(item?.product?.price) || 0;
    return Math.round(price); // This ensures we always send an integer
  };
  
  // This formatPrice is just for display, it's fine to show decimals here.
  const formatPriceForDisplay = (price) => `$${Number(price).toFixed(2)}`;

  const calculateSubtotal = () => cart.reduce((acc, item) => acc + (getPrice(item) * item.quantity), 0);
  
  const handlePlaceOrder = async () => {
    setLoading(true);
    setError('');
    try {
      const orderData = {
        items: cart.map(item => ({
          variant_id: item.variant.id,
          quantity: item.quantity,
          price: getPrice(item) // This will now correctly send an integer
        })),
        shipping_address: shippingAddress,
        billing_address: sameAsShipping ? shippingAddress : billingAddress,
        payment_method: paymentMethod,
        total_amount: calculateSubtotal(),
      };

      const orderResponse = await api.post('/orders/orders/', orderData);
      const { order_id } = orderResponse.data;
      if (!order_id) throw new Error("Order creation failed: No order ID received.");

      if (paymentMethod === 'paynow') {
        const paymentResponse = await api.post('/api/payments/initiate/', { order_id: order_id });
        const { redirect_url } = paymentResponse.data;
        if (redirect_url) {
          window.location.href = redirect_url;
        } else {
          throw new Error("Failed to get payment redirect URL.");
        }
      }
    } catch (err) {
      const errorMessage = err.response?.data?.items?.['0']?.price?.[0] || err.response?.data?.detail || err.response?.data?.error || 'An unexpected error occurred.';
      setError(errorMessage);
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="lg" sx={{ my: { xs: 3, md: 6 } }}>
      {isMobile && <Box mb={3}><OrderSummary /></Box>}

      <Typography variant="h4" component="h1" gutterBottom sx={{ fontFamily: "'Laginchy', serif", textAlign: 'center', mb: { xs: 3, md: 5 } }}>
        Checkout
      </Typography>

      {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}

      <Grid container spacing={{ xs: 3, md: 5 }}>
        
        {/* --- LEFT COLUMN (DESKTOP ONLY): Order Summary --- */}
        {!isMobile && (
          <Grid item md={5}>
            <Box sx={{ position: 'sticky', top: 80 }}>
              <OrderSummary />
            </Box>
          </Grid>
        )}

        {/* --- RIGHT COLUMN (DESKTOP) / MAIN CONTENT (MOBILE): Forms --- */}
        <Grid item xs={12} md={7}>
          <Stack spacing={4}>
            {/* ...Shipping and Payment cards are the same... */}
            <Paper variant="outlined" sx={{ p: { xs: 2, sm: 4 }, borderRadius: 2 }}>
              <Typography variant="h6" component="h2" gutterBottom sx={{ fontFamily: "'Laginchy', serif" }}>
                Shipping Information
              </Typography>
              <TextField
                label="Shipping Address"
                fullWidth
                margin="normal"
                multiline
                rows={4}
                value={shippingAddress}
                onChange={(e) => setShippingAddress(e.target.value)}
                required
              />
              <FormControlLabel
                control={<Checkbox checked={sameAsShipping} onChange={(e) => setSameAsShipping(e.target.checked)} />}
                label="My billing address is the same as my shipping address"
              />
              {!sameAsShipping && (
                <TextField
                  label="Billing Address"
                  fullWidth
                  margin="normal"
                  multiline
                  rows={4}
                  value={billingAddress}
                  onChange={(e) => setBillingAddress(e.target.value)}
                  required
                />
              )}
            </Paper>

            <Paper variant="outlined" sx={{ p: { xs: 2, sm: 4 }, borderRadius: 2 }}>
              <Typography variant="h6" component="h2" gutterBottom sx={{ fontFamily: "'Laginchy', serif" }}>
                Payment Method
              </Typography>
              <Box 
                sx={{ 
                  border: 1, 
                  borderColor: paymentMethod === 'paynow' ? 'primary.main' : 'divider',
                  borderRadius: 1, p: 2, mt: 2, cursor: 'pointer'
                }}
                onClick={() => setPaymentMethod('paynow')}
              >
                <FormControlLabel
                  control={<Checkbox checked={paymentMethod === 'paynow'} />}
                  label="Secure Payment via PayNow"
                  sx={{ width: '100%' }}
                />
                <Typography variant="body2" color="text.secondary" sx={{ pl: 4 }}>
                  Pay with Card, Mobile Money, and more.
                </Typography>
              </Box>
            </Paper>

            <Button
              variant="contained"
              color="primary"
              fullWidth
              size="large"
              onClick={handlePlaceOrder}
              disabled={loading || cart.length === 0 || !shippingAddress}
              sx={{ py: 1.5 }}
            >
              {loading ? <CircularProgress size={26} color="inherit" /> : `Place Order & Pay ${formatPriceForDisplay(calculateSubtotal())}`}
            </Button>
          </Stack>
        </Grid>
      </Grid>
    </Container>
  );
};

export default Checkout;