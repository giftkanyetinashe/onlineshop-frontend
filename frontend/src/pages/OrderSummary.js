import React, { useState } from 'react';
import { useCart } from '../context/CartContext';

// Import necessary MUI components and hooks
import {
  Typography,
  Box,
  Paper,
  Stack,
  Divider,
  useTheme,
  useMediaQuery,
  Collapse, // For the mobile animation
  IconButton,
} from '@mui/material';
import ShoppingBagOutlinedIcon from '@mui/icons-material/ShoppingBagOutlined';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';

const OrderSummary = () => {
  const { cart } = useCart();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md')); // Detects mobile/tablet view

  // State for the mobile accordion view
  const [isExpanded, setIsExpanded] = useState(false);

  // Helper functions
  const getPrice = (item) => Number(item?.variant?.price) || Number(item?.product?.discount_price) || Number(item?.product?.price) || 0;
  const formatPrice = (price) => `$${Number(price).toFixed(2)}`;
  const cartTotal = cart.reduce((acc, item) => acc + (getPrice(item) * item.quantity), 0);

  if (cart.length === 0) {
    return null; // Don't render anything if the cart is empty
  }

  // --- Reusable JSX Blocks to avoid duplication ---

  // Renders the list of items in the cart
  const cartItemsList = (
    <Stack spacing={2.5} my={3}>
      {cart.map(item => (
        <Stack direction="row" key={`${item.product.id}-${item.variant.id}`} spacing={2} alignItems="center">
          <Box
            component="img"
            src={item.product.images?.[0]?.image} 
            alt={item.product.name}
            sx={{ width: 64, height: 64, borderRadius: '4px', objectFit: 'cover', border: '1px solid', borderColor: 'divider' }}
          />
          <Box flexGrow={1}>
            <Typography variant="body1" fontWeight={500}>{item.product.name}</Typography>
            <Typography variant="body2" color="text.secondary">
              Qty: {item.quantity}
            </Typography>
          </Box>
          <Typography variant="body1" fontWeight={500}>
            {formatPrice(getPrice(item) * item.quantity)}
          </Typography>
        </Stack>
      ))}
    </Stack>
  );

  // Renders the price breakdown (subtotal, total, etc.)
  const priceDetails = (
    <Stack spacing={2}>
      <Stack direction="row" justifyContent="space-between">
        <Typography>Subtotal</Typography>
        <Typography>{formatPrice(cartTotal)}</Typography>
      </Stack>
      <Stack direction="row" justifyContent="space-between">
        <Typography>Shipping</Typography>
        <Typography>Free</Typography>
      </Stack>
      <Divider />
      <Stack direction="row" justifyContent="space-between">
        <Typography variant="h6">Total</Typography>
        <Typography variant="h6">{formatPrice(cartTotal)}</Typography>
      </Stack>
    </Stack>
  );

  // ===================================
  //  THE RESPONSIVE LOGIC
  // ===================================

  if (isMobile) {
    // --- MOBILE VIEW: Collapsible Accordion ---
    return (
      <Box sx={{ width: '100%', borderTop: 1, borderBottom: 1, borderColor: 'divider' }}>
        <Stack 
          direction="row" 
          justifyContent="space-between" 
          alignItems="center" 
          onClick={() => setIsExpanded(!isExpanded)}
          sx={{ p: 2, cursor: 'pointer' }}
        >
          <Stack direction="row" alignItems="center" spacing={1}>
            <ShoppingBagOutlinedIcon color="primary" />
            <Typography color="primary.main" fontWeight={500}>
              {isExpanded ? 'Hide' : 'Show'} order summary
            </Typography>
            <IconButton size="small" sx={{ p: 0 }}>
              {isExpanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
            </IconButton>
          </Stack>
          <Typography variant="h6">{formatPrice(cartTotal)}</Typography>
        </Stack>

        <Collapse in={isExpanded}>
          <Box sx={{ p: 2, borderTop: 1, borderColor: 'divider' }}>
            {cartItemsList}
            {priceDetails}
          </Box>
        </Collapse>
      </Box>
    );
  }

  // --- DESKTOP VIEW: Persistent Sidebar ---
  return (
    <Paper 
      variant="outlined" 
      sx={{ 
        p: { xs: 2, sm: 4 }, 
        borderRadius: 2
      }}
    >
      <Typography variant="h6" component="h2" gutterBottom sx={{ fontFamily: "'Laginchy', serif" }}>
        In Your Bag
      </Typography>
      {cartItemsList}
      <Divider sx={{ my: 3 }} />
      {priceDetails}
    </Paper>
  );
};

export default OrderSummary;