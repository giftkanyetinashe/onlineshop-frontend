// src/components/OrderSummary.js

import React, { useState } from 'react';
import { useCart } from '../context/CartContext'; // Import the context

// Import necessary MUI components and hooks
import {
  Typography,
  Box,
  Paper,
  Stack,
  Divider,
  useTheme,
  useMediaQuery,
  Collapse,
  IconButton,
} from '@mui/material';
import ShoppingBagOutlinedIcon from '@mui/icons-material/ShoppingBagOutlined';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';

const OrderSummary = () => {
  // --- UPGRADE: All data now comes directly from the CartContext ---
  const {
    cart,
    originalSubtotal,
    totalProductSavings,
    promoDiscount,
    appliedPromo,
    finalTotal
  } = useCart();
  
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [isExpanded, setIsExpanded] = useState(!isMobile); // Expanded by default on desktop

  if (cart.length === 0) {
    return null;
  }
  
  // --- Reusable JSX for the list of cart items ---
  const cartItemsList = (
    <Stack spacing={2.5} my={3}>
      {cart.map(item => {
        const product = item.product || item.variant?.product;
        const variant = item.variant;
        if (!product || !variant) return null;

        const price = Number(variant.price) || 0;
        const discountPrice = Number(variant.discount_price) || 0;
        const hasDiscount = discountPrice > 0 && discountPrice < price;
        const finalPrice = hasDiscount ? discountPrice : price;

        return (
          <Stack direction="row" key={`${product.id}-${variant.id}`} spacing={2} alignItems="flex-start">
            <Box
              component="img"
              src={variant.variant_image || product.images?.[0]?.image} 
              alt={product.name}
              sx={{ width: 64, height: 64, borderRadius: 2, objectFit: 'cover', border: `1px solid ${theme.palette.divider}` }}
            />
            <Box flexGrow={1}>
              <Typography variant="body1" fontWeight={500}>{product.name}</Typography>
              <Typography variant="body2" color="text.secondary">Qty: {item.quantity}</Typography>
            </Box>
            <Typography variant="body1" fontWeight={500} sx={{ flexShrink: 0 }}>
              ${(finalPrice * item.quantity).toFixed(2)}
            </Typography>
          </Stack>
        )
      })}
    </Stack>
  );

  // --- Reusable JSX for the price breakdown ---
  const priceDetails = (
    <Stack spacing={1.5}>
      <Stack direction="row" justifyContent="space-between">
        <Typography variant="body2" color="text.secondary">Subtotal</Typography>
        <Typography variant="body2" color="text.primary" sx={{ textDecoration: totalProductSavings > 0 ? 'line-through' : 'none' }}>
            ${originalSubtotal.toFixed(2)}
        </Typography>
      </Stack>
      
      {totalProductSavings > 0 && (
          <Stack direction="row" justifyContent="space-between">
              <Typography variant="body2" color="success.main">Product Savings</Typography>
              <Typography variant="body2" color="success.main">-${totalProductSavings.toFixed(2)}</Typography>
          </Stack>
      )}

      {promoDiscount > 0 && (
        <Stack direction="row" justifyContent="space-between">
          <Typography variant="body2" color="success.main">Promo ({appliedPromo.code})</Typography>
          <Typography variant="body2" color="success.main">-${promoDiscount.toFixed(2)}</Typography>
        </Stack>
      )}
      
      <Stack direction="row" justifyContent="space-between">
        <Typography variant="body2" color="text.secondary">Shipping</Typography>
        <Typography variant="body2" color="text.primary">Free</Typography>
      </Stack>
      
      <Divider sx={{ my: 1.5 }} />
      
      <Stack direction="row" justifyContent="space-between" alignItems="center">
        <Typography variant="body1" fontWeight="bold">Total</Typography>
        <Typography variant="h6" component="span" fontWeight="bold">${finalTotal.toFixed(2)}</Typography>
      </Stack>
    </Stack>
  );

  // Mobile: Collapsible Accordion View
  if (isMobile) {
    return (
      <Box sx={{ width: '100%', borderTop: `1px solid ${theme.palette.divider}`, borderBottom: `1px solid ${theme.palette.divider}`, bgcolor: 'background.paper' }}>
        <Stack direction="row" justifyContent="space-between" alignItems="center" onClick={() => setIsExpanded(!isExpanded)} sx={{ p: 2, cursor: 'pointer' }}>
          <Stack direction="row" alignItems="center" spacing={1}>
            <ShoppingBagOutlinedIcon color="primary" />
            <Typography sx={{ ...theme.typography.button, color: 'primary.main' }}>
              {isExpanded ? 'Hide' : 'Show'} order summary
            </Typography>
            <IconButton size="small" sx={{ p: 0.25 }} color="primary">
              {isExpanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
            </IconButton>
          </Stack>
          <Typography variant="h6" fontWeight="bold">${finalTotal.toFixed(2)}</Typography>
        </Stack>

        <Collapse in={isExpanded} timeout="auto" unmountOnExit>
          <Box sx={{ p: 2, pt: 0 }}>
            <Divider sx={{ mb: 3 }} />
            {cartItemsList}
            {priceDetails}
          </Box>
        </Collapse>
      </Box>
    );
  }

  // Desktop: Persistent Sidebar View
  return (
    <Paper elevation={0} sx={{ p: 4, borderRadius: 3, border: `1px solid ${theme.palette.divider}`, bgcolor: 'background.paper' }}>
      <Typography variant="h6" component="h2" gutterBottom>In Your Bag</Typography>
      {cartItemsList}
      {priceDetails}
    </Paper>
  );
};

export default OrderSummary;