// src/pages/Checkout.jsx

import React, { useState, useEffect } from 'react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import OrderSummary from './OrderSummary'; // This component is now fully context-aware
import {
  Container, Typography, Box, Grid, TextField, Button, FormControlLabel,
  Checkbox, Paper, CircularProgress, Alert, Stack, useTheme, useMediaQuery,
} from '@mui/material';
import { PayPalButtons, usePayPalScriptReducer } from '@paypal/react-paypal-js';

const Checkout = () => {
  // --- UPGRADE: Get finalTotal and appliedPromo directly from the context ---
  const { cart, finalTotal, appliedPromo } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  const isMobile = useMediaQuery(useTheme().breakpoints.down('md'));
  const [{ isPending }] = usePayPalScriptReducer();

  const [shippingAddress, setShippingAddress] = useState(user?.address || '');
  const [billingAddress, setBillingAddress] = useState(user?.address || '');
  const [sameAsShipping, setSameAsShipping] = useState(true);
  const [paymentMethod, setPaymentMethod] = useState('paynow');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [orderIdForPaypal, setOrderIdForPaypal] = useState(null);

  // The buildOrderPayload function is now the single source for creating the order data
  const buildOrderPayload = (method) => {
    const validCartItems = cart.filter(item => item && item.product && item.variant && item.variant.id);
    return {
      items: validCartItems.map(item => ({
        variant_id: item.variant.id,
        quantity: item.quantity,
      })),
      shipping_address: shippingAddress,
      billing_address: sameAsShipping ? shippingAddress : billingAddress,
      payment_method: method,
      promo_code: appliedPromo ? appliedPromo.code : null,
    };
  };

  // All handler functions (prepareForPaypal, createPayPalOrder, onPayPalApprove, handlePlaceOrder)
  // are correct from the previous version and do not need to change.
  // ... Paste your existing handlers here ...
  const prepareForPaypal = async () => {
    setLoading(true);
    setError('');
    try {
      const orderPayload = buildOrderPayload('paypal');
      if (orderPayload.items.length !== cart.length) {
          setError("Your cart has invalid items. Please review your cart and try again.");
          setLoading(false);
          return;
      }
      const response = await api.post('/orders/orders/', orderPayload);
      setOrderIdForPaypal(response.data.order_id);
    } catch (err) {
      setError('Could not prepare order for PayPal. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const createPayPalOrder = async () => {
    try {
      const paypalResponse = await api.post('/api/payments/paypal/create/', { order_id: orderIdForPaypal });
      return paypalResponse.data.id;
    } catch (err) {
      setError('Could not connect to PayPal. Please try another payment method.');
      return null;
    }
  };

  const onPayPalApprove = async (data) => {
    try {
      const response = await api.post('/api/payments/paypal/capture/', {
        paypal_order_id: data.orderID,
        user_order_id: orderIdForPaypal,
      });
      if (response.status === 200) {
        navigate(`/payment-status?status=success&orderId=${response.data.order_id}`);
      }
    } catch (err) {
      setError('Payment capture failed. Please contact support.');
    }
  };

  const onPayPalError = () => {
    setError('An error occurred with the PayPal transaction. Please try again.');
  };

  const handlePlaceOrder = async () => {
    setLoading(true);
    setError('');
    try {
      const orderData = buildOrderPayload(paymentMethod);
      if (orderData.items.length !== cart.length) {
          setError("Your cart has invalid items. Please review your cart and try again.");
          setLoading(false);
          return;
      }

      const orderResponse = await api.post('/orders/orders/', orderData);
      const newOrder = orderResponse.data;

      if (paymentMethod === 'paynow') {
        const paymentResponse = await api.post('/api/payments/initiate/', { order_id: newOrder.order_id });
        const { redirect_url } = paymentResponse.data;
        if (redirect_url) {
          window.location.href = redirect_url;
        } else {
          throw new Error("Failed to get payment redirect URL.");
        }
      } else if (paymentMethod === 'direct_transfer') {
        navigate(`/order-confirmation/${newOrder.order_number}`, { state: { order: newOrder } });
      }

    } catch (err) {
      setError(err.response?.data?.error || 'An unexpected error occurred.');
    } finally {
      setLoading(false);
    }
  };
  
  useEffect(() => {
    if (paymentMethod !== 'paypal') {
        setOrderIdForPaypal(null);
    }
  }, [paymentMethod]);


  return (
    <Container maxWidth="lg" sx={{ my: { xs: 3, md: 6 } }}>
      {isMobile && <Box mb={3}><OrderSummary /></Box>}

      <Typography variant="h4" component="h1" gutterBottom sx={{ fontFamily: "'Laginchy', serif", textAlign: 'center', mb: { xs: 3, md: 5 } }}>
        Checkout
      </Typography>

      {error && <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError('')}>{error}</Alert>}

      <Grid container spacing={{ xs: 3, md: 5 }}>
        {!isMobile && (
          <Grid item md={5}>
            <Box sx={{ position: 'sticky', top: 80 }}><OrderSummary /></Box>
          </Grid>
        )}

        <Grid item xs={12} md={7}>
          <Stack spacing={4}>
            <Paper variant="outlined" sx={{ p: { xs: 2, sm: 4 }, borderRadius: 2 }}>
              <Typography variant="h6" component="h2" gutterBottom sx={{ fontFamily: "'Laginchy', serif" }}>Shipping Information</Typography>
              <TextField fullWidth margin="normal" multiline rows={4} label="Shipping Address" value={shippingAddress} onChange={(e) => setShippingAddress(e.target.value)} required />
              <FormControlLabel control={<Checkbox checked={sameAsShipping} onChange={(e) => setSameAsShipping(e.target.checked)} />} label="My billing address is the same as my shipping address"/>
              {!sameAsShipping && ( <TextField fullWidth margin="normal" multiline rows={4} label="Billing Address" value={billingAddress} onChange={(e) => setBillingAddress(e.target.value)} required /> )}
            </Paper>

            <Paper variant="outlined" sx={{ p: { xs: 2, sm: 4 }, borderRadius: 2 }}>
              <Typography variant="h6" component="h2" gutterBottom sx={{ fontFamily: "'Laginchy', serif" }}>Payment Method</Typography>
              <Box sx={{ border: 1, borderColor: paymentMethod === 'paynow' ? 'primary.main' : 'divider', borderRadius: 1, p: 2, mt: 2, cursor: 'pointer' }} onClick={() => setPaymentMethod('paynow')}><FormControlLabel control={<Checkbox checked={paymentMethod === 'paynow'} />} label="Secure Payment via PayNow" sx={{ width: '100%' }} /><Typography variant="body2" color="text.secondary" sx={{ pl: 4 }}>Pay with Card, Mobile Money, and more.</Typography></Box>
              <Box sx={{ border: 1, borderColor: paymentMethod === 'direct_transfer' ? 'primary.main' : 'divider', borderRadius: 1, p: 2, mt: 2, cursor: 'pointer' }} onClick={() => setPaymentMethod('direct_transfer')}><FormControlLabel control={<Checkbox checked={paymentMethod === 'direct_transfer'} />} label="Direct Bank Transfer" sx={{ width: '100%' }} /><Typography variant="body2" color="text.secondary" sx={{ pl: 4 }}>Make your payment directly into our bank account.</Typography></Box>
              <Box sx={{ border: 1, borderColor: paymentMethod === 'paypal' ? 'primary.main' : 'divider', borderRadius: 1, p: 2, mt: 2, cursor: 'pointer' }} onClick={() => setPaymentMethod('paypal')}><FormControlLabel control={<Checkbox checked={paymentMethod === 'paypal'} />} label="PayPal" sx={{ width: '100%' }} /><Typography variant="body2" color="text.secondary" sx={{ pl: 4 }}>Secure international payments via PayPal.</Typography></Box>
            </Paper>

            {paymentMethod === 'paypal' ? (
                orderIdForPaypal ? (
                    <Box mt={3}>{isPending ? <CircularProgress /> : <PayPalButtons style={{ layout: "vertical" }} createOrder={createPayPalOrder} onApprove={onPayPalApprove} onError={onPayPalError} disabled={loading || cart.length === 0 || !shippingAddress} />}</Box>
                ) : (
                    <Button variant="contained" color="primary" fullWidth size="large" onClick={prepareForPaypal} disabled={loading || cart.length === 0 || !shippingAddress} sx={{ py: 1.5, mt: 3 }}>
                        {loading ? <CircularProgress size={26} color="inherit" /> : `Proceed to PayPal & Pay $${finalTotal.toFixed(2)}`}
                    </Button>
                )
            ) : (
                <Button variant="contained" color="primary" fullWidth size="large" onClick={handlePlaceOrder} disabled={loading || cart.length === 0 || !shippingAddress} sx={{ py: 1.5, mt: 3 }}>
                    {loading ? <CircularProgress size={26} color="inherit" /> : `Place Order & Pay $${finalTotal.toFixed(2)}`}
                </Button>
            )}
          </Stack>
        </Grid>
      </Grid>
    </Container>
  );
};

export default Checkout;