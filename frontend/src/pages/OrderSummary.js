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
  Collapse,
  IconButton,
} from '@mui/material';
import ShoppingBagOutlinedIcon from '@mui/icons-material/ShoppingBagOutlined';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';

const OrderSummary = () => {
  const { cart } = useCart();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const [isExpanded, setIsExpanded] = useState(false);

  // Helper functions (no changes needed here)
  const getPrice = (item) => Number(item?.variant?.price) || Number(item?.product?.discount_price) || Number(item?.product?.price) || 0;
  const formatPrice = (price) => `$${Number(price).toFixed(2)}`;
  const cartTotal = cart.reduce((acc, item) => acc + (getPrice(item) * item.quantity), 0);

  if (cart.length === 0) {
    return null;
  }

  // --- Reusable JSX Blocks (Refactored for Brand Identity) ---

  const cartItemsList = (
    <Stack spacing={2.5} my={3}>
      {cart.map(item => (
        <Stack direction="row" key={`${item.product.id}-${item.variant.id}`} spacing={2} alignItems="flex-start">
          <Box
            component="img"
            src={item.product.images?.[0]?.image} 
            alt={item.product.name}
            // Brand Change: Using 'blush' for a soft, on-brand border
            sx={{ width: 64, height: 64, borderRadius: '4px', objectFit: 'cover', border: `1px solid ${theme.palette.blush}` }}
          />
          <Box flexGrow={1}>
            {/* Brand Change: Emphasizing product name */}
            <Typography variant="body1" fontWeight={500}>{item.product.name}</Typography>
            <Typography variant="body2" color="text.secondary">
              Qty: {item.quantity}
            </Typography>
          </Box>
          <Typography variant="body1" fontWeight={500} sx={{ flexShrink: 0 }}>
            {formatPrice(getPrice(item) * item.quantity)}
          </Typography>
        </Stack>
      ))}
    </Stack>
  );

  const priceDetails = (
    <Stack spacing={1.5}>
      <Stack direction="row" justifyContent="space-between">
        <Typography variant="body2" color="text.secondary">Subtotal</Typography>
        <Typography variant="body2" color="text.primary">{formatPrice(cartTotal)}</Typography>
      </Stack>
      <Stack direction="row" justifyContent="space-between">
        <Typography variant="body2" color="text.secondary">Shipping</Typography>
        <Typography variant="body2" color="text.primary">Free</Typography>
      </Stack>
      {/* Brand Change: Using 'blush' for divider color */}
      <Divider sx={{ my: 1.5, borderColor: theme.palette.blush }} />
      <Stack direction="row" justifyContent="space-between" alignItems="center">
        {/* Brand Change: Using bold Circular Std for Total, not Laginchy */}
        <Typography variant="body1" fontWeight="bold">Total</Typography>
        <Typography variant="h6" component="span" fontWeight="bold">{formatPrice(cartTotal)}</Typography>
      </Stack>
    </Stack>
  );

  // ===================================
  //  THE RESPONSIVE LOGIC
  // ===================================

  if (isMobile) {
    // --- MOBILE VIEW: Collapsible Accordion (Refactored) ---
    return (
      <Box sx={{ 
        width: '100%', 
        // Brand Change: Using blush for a softer border
        borderTop: `1px solid ${theme.palette.blush}`, 
        borderBottom: `1px solid ${theme.palette.blush}`,
        bgcolor: 'background.paper' // Using paper color for contrast
      }}>
        <Stack 
          direction="row" 
          justifyContent="space-between" 
          alignItems="center" 
          onClick={() => setIsExpanded(!isExpanded)}
          sx={{ p: 2, cursor: 'pointer' }}
        >
          <Stack direction="row" alignItems="center" spacing={1}>
            <ShoppingBagOutlinedIcon color="primary" />
            {/* Brand Change: Applying button typography for consistent CTAs */}
            <Typography sx={{ ...theme.typography.button, color: 'primary.main' }}>
              {isExpanded ? 'Hide' : 'Show'} order summary
            </Typography>
            <IconButton size="small" sx={{ p: 0.25 }} color="primary">
              {isExpanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
            </IconButton>
          </Stack>
          <Typography variant="h6" fontWeight="bold">{formatPrice(cartTotal)}</Typography>
        </Stack>

        <Collapse in={isExpanded} timeout="auto" unmountOnExit>
          <Box sx={{ p: 2, pt: 0 }}>
            {/* Brand Change: Divider for better visual separation */}
            <Divider sx={{ mb: 3, borderColor: theme.palette.blush }} />
            {cartItemsList}
            {priceDetails}
          </Box>
        </Collapse>
      </Box>
    );
  }

  // --- DESKTOP VIEW: Persistent Sidebar (Refactored) ---
  return (
    <Paper 
      elevation={0} // Brand Change: Flat design, no shadow
      sx={{ 
        p: 4, 
        // Brand Change: Soft border radius and on-brand border color
        borderRadius: '8px', 
        border: `1px solid ${theme.palette.blush}`,
        // Use 'paper' background, which is white, to pop against the 'alabaster' page background
        bgcolor: 'background.paper', 
      }}
    >
      <Typography variant="h6" component="h2" gutterBottom>
        In Your Bag
      </Typography>
      {cartItemsList}
      {priceDetails}
    </Paper>
  );
};

export default OrderSummary;