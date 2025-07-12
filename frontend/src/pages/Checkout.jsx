import React, { useState } from 'react';
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
  Alert
} from '@mui/material';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

const Checkout = () => {
  const { cart } = useCart(); // We won't clear cart here anymore, the status page will
  const { user } = useAuth();

  const [shippingAddress, setShippingAddress] = useState(user?.address || '');
  const [billingAddress, setBillingAddress] = useState(user?.address || '');
  const [sameAsShipping, setSameAsShipping] = useState(true);
  const [paymentMethod, setPaymentMethod] = useState('paynow'); // Default to PayNow

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(''); // To display errors to the user

  const getPrice = (item) => {
    // This function is assumed to be correct
    const variantPrice = Number(item?.variant?.price);
    const discountPrice = Number(item?.product?.discount_price);
    const productPrice = Number(item?.product?.price);
    if (!isNaN(variantPrice) && variantPrice > 0) return Math.round(variantPrice);
    if (!isNaN(discountPrice) && discountPrice > 0) return Math.round(discountPrice);
    if (!isNaN(productPrice) && productPrice > 0) return Math.round(productPrice);
    return 0;
  };

  const calculateSubtotal = () => {
    return cart.reduce((acc, item) => acc + (getPrice(item) * item.quantity), 0).toFixed(2);
  };

  const handlePlaceOrder = async () => {
    setLoading(true);
    setError('');

    // **Step 1: Create the Order in the backend**
    try {
      console.log("Step 1: Creating order...");
      const orderData = {
        items: cart.map(item => ({
          variant_id: item.variant.id,
          quantity: item.quantity,
          price: getPrice(item)
        })),
        shipping_address: shippingAddress,
        billing_address: sameAsShipping ? shippingAddress : billingAddress,
        payment_method: paymentMethod,
        // The backend should calculate the final total, but sending it can be a good cross-check
        total_amount: calculateSubtotal(),
      };

      // This API call creates the order and returns its ID
      const orderResponse = await api.post('/orders/orders/', orderData);

      // **IMPORTANT**: Your '/orders/orders/' endpoint MUST return the new order's ID.
      // e.g., { "order_id": 123, "order_number": "ABC-123" }
      const { order_id } = orderResponse.data;

      if (!order_id) {
        throw new Error("Order creation failed: Did not receive an order ID from the server.");
      }
      console.log(`Step 1 Success: Order ${order_id} created.`);


      // **Step 2: Initiate Payment for the newly created order (if using PayNow)**
      if (paymentMethod === 'paynow') {
        console.log("Step 2: Initiating PayNow payment...");
        const paymentResponse = await api.post('/api/payments/initiate/', { order_id: order_id });

        const { redirect_url } = paymentResponse.data;

        if (redirect_url) {
          // **Step 3: Redirect user to PayNow gateway**
          console.log("Step 2 Success: Received redirect URL. Redirecting user...");
          window.location.href = redirect_url;
        } else {
          throw new Error("Failed to get payment redirect URL from the server.");
        }
      } else {
        // Handle other payment methods like "Cash on Delivery"
        // For COD, you would redirect to a simple "Order Received" page.
        // navigate(`/order-success/${order_id}`);
        setLoading(false);
      }
    } catch (err) {
      console.error('Checkout process failed:', err);
      const errorMessage = err.response?.data?.error || 'An unexpected error occurred. Please try again.';
      setError(errorMessage);
      setLoading(false);
    }
  };

  // The "Thank You" screen is now handled by the separate /payment-status page.
  // We no longer need the 'orderSuccess' or 'orderNumber' state here.

  return (
    <Container maxWidth="lg">
      <Box my={4}>
        <Typography variant="h4" gutterBottom>
          Checkout
        </Typography>

        {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}

        <Grid container spacing={4}>
          <Grid item xs={12} md={7}>
            <Paper elevation={3} sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                Shipping Information
              </Typography>
              <TextField
                label="Shipping Address"
                fullWidth margin="normal" multiline rows={4}
                value={shippingAddress}
                onChange={(e) => setShippingAddress(e.target.value)}
                required
              />
              <FormControlLabel
                control={<Checkbox checked={sameAsShipping} onChange={(e) => setSameAsShipping(e.target.checked)} />}
                label="Billing address same as shipping address"
              />
              {!sameAsShipping && (
                <TextField
                  label="Billing Address"
                  fullWidth margin="normal" multiline rows={4}
                  value={billingAddress}
                  onChange={(e) => setBillingAddress(e.target.value)}
                  required
                />
              )}

              <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>
                Payment Method
              </Typography>
              <Box>
                {/* Add other payment methods here if you have them */}
                <FormControlLabel
                  control={<Checkbox checked={paymentMethod === 'paynow'} onChange={() => setPaymentMethod('paynow')} />}
                  label="Pay with PayNow (Card, Mobile Money)"
                />
              </Box>
            </Paper>
          </Grid>

          <Grid item xs={12} md={5}>
            <Paper elevation={3} sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                Order Summary
              </Typography>
              <Box mb={2}>
                {cart.map(item => (
                  <Box key={`${item.product.id}-${item.variant.id}`} display="flex" justifyContent="space-between" mb={1}>
                    <Typography>
                      {item.product.name} ({item.variant.size}) × {item.quantity}
                    </Typography>
                    <Typography>${(getPrice(item) * item.quantity).toFixed(2)}</Typography>
                  </Box>
                ))}
              </Box>

              <Box borderTop={1} borderColor="divider" pt={2}>
                <Box display="flex" justifyContent="space-between" mb={2}>
                  <Typography variant="h6">Total:</Typography>
                  <Typography variant="h6">${calculateSubtotal()}</Typography>
                </Box>

                <Button
                  variant="contained"
                  color="primary"
                  fullWidth
                  size="large"
                  onClick={handlePlaceOrder}
                  disabled={loading || cart.length === 0 || !shippingAddress}
                >
                  {loading ? (
                    <CircularProgress size={24} color="inherit" />
                  ) : (
                    'Place Order & Proceed to Payment'
                  )}
                </Button>
              </Box>
            </Paper>
          </Grid>
        </Grid>
      </Box>
    </Container>
  );
};

export default Checkout;