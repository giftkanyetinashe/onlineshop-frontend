import React, { useState, useEffect } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { Container, Typography, CircularProgress, Button, Paper, Alert, Box } from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import ErrorIcon from '@mui/icons-material/Error';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../services/api';
import { useCart } from '../context/CartContext';

// --- Best Practice: Use constants for status states ---
const PAYMENT_STATUS = {
  CHECKING: 'CHECKING',
  SUCCESS: 'PAID',
  FAILED: 'FAILED',
  CANCELLED: 'CANCELLED',
};

// --- FIX #1: Define the useQuery hook in the file ---
const useQuery = () => {
  return new URLSearchParams(useLocation().search);
};

// --- Best Practice: Isolate complex logic into a custom hook ---
const usePaymentPolling = (reference) => {
  const [status, setStatus] = useState(PAYMENT_STATUS.CHECKING);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!reference) {
      setStatus(PAYMENT_STATUS.FAILED);
      setError('No payment reference was found in the URL.');
      return;
    }

    const pollId = setInterval(() => {
      // Don't poll if we already have a final status
      if ([PAYMENT_STATUS.SUCCESS, PAYMENT_STATUS.FAILED, PAYMENT_STATUS.CANCELLED].includes(status)) {
        clearInterval(pollId);
        return;
      }
      api.get(`/api/payments/status/${reference}/`)
        .then(response => {
          const apiStatus = response.data.status?.toUpperCase();
          if ([PAYMENT_STATUS.SUCCESS, PAYMENT_STATUS.FAILED, PAYMENT_STATUS.CANCELLED].includes(apiStatus)) {
            setStatus(apiStatus);
            clearInterval(pollId);
          }
        })
        .catch(err => {
          console.error('Polling Error:', err);
          setError('There was a problem verifying your payment. Please check your order history or contact support.');
          setStatus(PAYMENT_STATUS.FAILED);
          clearInterval(pollId);
        });
    }, 3000);

    const timeoutId = setTimeout(() => {
      if (status === PAYMENT_STATUS.CHECKING) {
        console.warn('Polling timed out.');
        setError('Verification is taking longer than expected. Please check your order history for updates or contact support.');
        setStatus(PAYMENT_STATUS.FAILED);
        clearInterval(pollId);
      }
    }, 90000);

    return () => {
      clearInterval(pollId);
      clearTimeout(timeoutId);
    };
  }, [reference, status]); // --- FIX #2: Add 'status' to the dependency array ---

  return { status, error };
};

// Helper component for animated status display (This part is fine)
const StatusDisplay = ({ status, error }) => {
  const statusConfig = {
    [PAYMENT_STATUS.CHECKING]: {
      icon: <CircularProgress size={60} />,
      title: 'Verifying Payment...',
      message: 'Please do not close this window. We are confirming the transaction with the payment provider.',
    },
    [PAYMENT_STATUS.SUCCESS]: {
      icon: <CheckCircleIcon color="success" sx={{ fontSize: 80 }} />,
      title: 'Payment Successful!',
      message: 'Thank you for your order. A confirmation receipt has been sent to your email.',
      actions: (
        <>
          <Button component={Link} to="/profile/orders" variant="contained" sx={{ mr: 2 }}>View My Orders</Button>
          <Button component={Link} to="/products" variant="outlined">Continue Shopping</Button>
        </>
      ),
    },
    [PAYMENT_STATUS.FAILED]: {
      icon: <ErrorIcon color="error" sx={{ fontSize: 80 }} />,
      title: 'Payment Failed',
      message: error || 'An unexpected error occurred. Your card has not been charged.',
      isError: true,
      actions: <Button component={Link} to="/checkout" variant="contained">Try Again</Button>,
    },
    [PAYMENT_STATUS.CANCELLED]: {
      icon: <CancelIcon color="warning" sx={{ fontSize: 80 }} />,
      title: 'Payment Cancelled',
      message: 'Your payment process was cancelled. Your order has not been completed.',
      actions: <Button component={Link} to="/checkout" variant="contained">Return to Checkout</Button>,
    },
  };

  const currentStatus = statusConfig[status];
  if (!currentStatus) return null; // Defensive check

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={status}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        transition={{ duration: 0.3 }}
      >
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <Box sx={{ mb: 2 }}>{currentStatus.icon}</Box>
          <Typography variant="h4" component="h1" gutterBottom>{currentStatus.title}</Typography>
          {currentStatus.isError ? (
            <Alert severity="error" sx={{ width: '100%', mb: 2 }}>{currentStatus.message}</Alert>
          ) : (
            <Typography color="text.secondary" sx={{ mb: 4 }}>{currentStatus.message}</Typography>
          )}
          {currentStatus.actions}
        </Box>
      </motion.div>
    </AnimatePresence>
  );
};


// Main component (This part is fine)
const PaymentStatusPage = () => {
  const query = useQuery();
  const reference = query.get('reference');
  const { clearCart } = useCart();
  const { status, error } = usePaymentPolling(reference);

  useEffect(() => {
    if (reference) {
      clearCart();
    }
  }, [reference, clearCart]);

  return (
    <Container maxWidth="sm">
      <Paper elevation={3} sx={{ mt: 8, p: { xs: 3, sm: 5 }, display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
        <StatusDisplay status={status} error={error} />
      </Paper>
    </Container>
  );
};

export default PaymentStatusPage;