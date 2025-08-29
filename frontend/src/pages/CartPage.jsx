// src/pages/CartPage.jsx

import React, { useState, useEffect } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { useCart } from '../context/CartContext';
//

// Import necessary MUI components and hooks
import {
  Container, Typography, Box, Button, IconButton, Grid, Stack, Paper,
  useTheme, useMediaQuery, TextField, CircularProgress, Divider,
} from '@mui/material';

// Import icons
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';
import ShoppingBagOutlinedIcon from '@mui/icons-material/ShoppingBagOutlined';
import BrokenImageIcon from '@mui/icons-material/BrokenImage';

// --- CartItem and ImagePlaceholder components remain the same ---
// (No changes needed in the first half of the file)

const ImagePlaceholder = () => (
  <Box sx={{ width: 80, height: 80, borderRadius: 2, display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: 'grey.200', color: 'grey.500' }}>
    <BrokenImageIcon />
  </Box>
);

const CartItem = ({ item, isMobile, onRemove }) => {
  const { updateQuantity } = useCart();
  const variant = item.variant;
  const product = item.product || variant?.product;
  const [displayQuantity, setDisplayQuantity] = useState(item.quantity);
  const [isUpdating, setIsUpdating] = useState(false);
  const price = Number(variant?.price) || 0;
  const discountPrice = Number(variant?.discount_price) || 0;
  const hasDiscount = discountPrice > 0 && discountPrice < price;
  const finalPrice = hasDiscount ? discountPrice : price;
  const stock = variant?.stock ?? Infinity;
  const imageUrl = variant?.variant_image || product?.images?.[0]?.image;

  // --- THIS IS THE FIX ---
  // The 'stock' variable has been added to the dependency array.
  useEffect(() => {
    if (displayQuantity === item.quantity) { setIsUpdating(false); return; }
    setIsUpdating(true);
    const handler = setTimeout(() => {
      const newQuantity = Math.max(1, Math.min(displayQuantity, stock));
      updateQuantity(product?.id, variant?.id, newQuantity);
    }, 750);
    return () => clearTimeout(handler);
  }, [displayQuantity, item.quantity, product?.id, variant?.id, updateQuantity, stock]);

  if (!product || !variant) return null;
  
  const handleQuantityInputChange = (e) => { setDisplayQuantity(e.target.value === '' ? 1 : parseInt(e.target.value, 10) || 1); };

  const QuantityChanger = () => (
    <Stack direction="row" alignItems="center" spacing={1}>
      <IconButton size="small" onClick={() => setDisplayQuantity(q => Math.max(1, q - 1))} disabled={isUpdating}><RemoveIcon fontSize="small" /></IconButton>
      {isUpdating ? <CircularProgress size={20} /> : <TextField value={displayQuantity} onChange={handleQuantityInputChange} size="small" sx={{ width: '60px', '& .MuiInputBase-input': { textAlign: 'center' } }} inputProps={{ type: 'number', min: 1, max: stock }} />}
      <IconButton size="small" onClick={() => setDisplayQuantity(q => Math.min(q + 1, stock))} disabled={isUpdating}><AddIcon fontSize="small" /></IconButton>
    </Stack>
  );

  const itemSubtotal = finalPrice * displayQuantity;
  
  const ProductInfo = () => (
    <Stack direction="row" spacing={2} alignItems="center" flexGrow={1}>
      {imageUrl ? <Box component="img" src={imageUrl} alt={product.name} sx={{ width: 80, height: 80, borderRadius: 2, objectFit: 'cover' }} /> : <ImagePlaceholder />}
      <Box>
        <Typography variant="body1" fontWeight={500}>{product.name}</Typography>
        <Typography variant="body2" color="text.secondary">{variant.shade_name ? `${variant.shade_name} - ${variant.size}` : variant.size}</Typography>
        {hasDiscount ? (
          <Stack direction="row" spacing={1} alignItems="center"><Typography variant="body2" fontWeight={500} color="error.main">${finalPrice.toFixed(2)}</Typography><Typography variant="body2" sx={{ textDecoration: 'line-through', color: 'text.secondary' }}>${price.toFixed(2)}</Typography></Stack>
        ) : (<Typography variant="body2" fontWeight={500}>${finalPrice.toFixed(2)}</Typography>)}
        {displayQuantity > stock && <Typography variant="caption" color="error">Only {stock} in stock</Typography>}
      </Box>
    </Stack>
  );

  if (isMobile) {
    return (
      <Paper variant="outlined" sx={{ p: 2, borderRadius: 3 }}>
        <Stack direction="row" justifyContent="space-between"><ProductInfo /><IconButton onClick={() => onRemove(product.id, variant.id)} size="small" sx={{ alignSelf: 'flex-start' }}><DeleteOutlineIcon fontSize="small" /></IconButton></Stack>
        <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mt: 2 }}><QuantityChanger /><Typography variant="h6">${itemSubtotal.toFixed(2)}</Typography></Stack>
      </Paper>
    );
  }

  return (
    <Stack direction="row" spacing={2} alignItems="center">
      <ProductInfo /><QuantityChanger /><Typography variant="body1" fontWeight={500} sx={{ width: '100px', textAlign: 'right' }}>${itemSubtotal.toFixed(2)}</Typography><IconButton onClick={() => onRemove(product.id, variant.id)} size="small"><DeleteOutlineIcon fontSize="small"/></IconButton>
    </Stack>
  );
};


// --- Main CartPage Component ---
const CartPage = () => {
  const {
    cart,
    removeFromCart,
    clearCart,
    originalSubtotal,
    totalProductSavings,
    promoDiscount,
    finalTotal,
    promoCode,
    setPromoCode,
    appliedPromo,
    promoError,
    isPromoLoading,
    handleApplyPromo,
    removePromo,
  } = useCart();
  
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const validCartItems = cart.filter(item => item.product && item.variant);
  
  if (validCartItems.length === 0) {
    return (
      <Container maxWidth="sm">
        <Box my={8} textAlign="center" display="flex" flexDirection="column" alignItems="center" gap={2}>
          <ShoppingBagOutlinedIcon sx={{ fontSize: '4rem', color: 'text.secondary' }} />
          <Typography variant="h5" component="h1" sx={{ fontFamily: "'Laginchy', serif" }}>Your Bag is Empty</Typography>
          <Typography color="text.secondary" sx={{ mb: 2 }}>Ready to find your new favorite?</Typography>
          <Button variant="contained" color="primary" component={RouterLink} to="/products" size="large">Continue Shopping</Button>
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ my: { xs: 3, md: 6 } }}>
      <Typography variant="h4" component="h1" gutterBottom sx={{ fontFamily: "'Laginchy', serif", textAlign: 'center', mb: { xs: 3, md: 5 } }}>Your Bag</Typography>
      
      <Grid container spacing={{ xs: 3, md: 5 }}>
        <Grid item xs={12} md={8}>
          <Stack spacing={3} divider={<Divider />}>
            {validCartItems.map((item) => <CartItem key={`${item.product?.id}-${item.variant.id}`} item={item} isMobile={isMobile} onRemove={removeFromCart} />)}
          </Stack>
        </Grid>
        
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: { xs: 2, sm: 3 }, borderRadius: 3, border: `1px solid ${theme.palette.divider}`, position: 'sticky', top: 100 }}>
            <Typography variant="h6" gutterBottom sx={{ fontFamily: "'Laginchy', serif" }}>Order Summary</Typography>
            
            <Stack spacing={1} my={3}>
              <Stack direction="row" justifyContent="space-between">
                <Typography color="text.secondary">Subtotal</Typography>
                <Typography sx={{ textDecoration: totalProductSavings > 0 ? 'line-through' : 'none' }}>
                    ${originalSubtotal.toFixed(2)}
                </Typography>
              </Stack>

              {totalProductSavings > 0 && (
                <Stack direction="row" justifyContent="space-between">
                  <Typography color="success.main">Product Savings</Typography>
                  <Typography color="success.main">- ${totalProductSavings.toFixed(2)}</Typography>
                </Stack>
              )}
              
              {promoDiscount > 0 && (
                <Stack direction="row" justifyContent="space-between">
                  <Typography color="success.main">Promo Code ({appliedPromo.code})</Typography>
                  <Typography color="success.main">-${promoDiscount.toFixed(2)}</Typography>
                </Stack>
              )}
              
              <Stack direction="row" justifyContent="space-between"><Typography color="text.secondary">Shipping</Typography><Typography>Calculated at next step</Typography></Stack>
            </Stack>
            
            {appliedPromo ? (
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', bgcolor: 'success.light', p: 1, borderRadius: 1, mb: 2 }}>
                    <Typography variant="body2" color="success.dark" fontWeight="bold">Code "{appliedPromo.code}" applied!</Typography>
                    <Button size="small" onClick={removePromo}>Remove</Button>
                </Box>
            ) : (
                <Stack direction="row" spacing={1} mb={2}>
                  <TextField size="small" placeholder="Promo Code" value={promoCode} onChange={(e) => setPromoCode(e.target.value)} fullWidth error={!!promoError} helperText={promoError} />
                  <Button variant="outlined" onClick={handleApplyPromo} disabled={!promoCode || isPromoLoading}>
                    {isPromoLoading ? <CircularProgress size={24} /> : 'Apply'}
                  </Button>
                </Stack>
            )}

            <Divider sx={{ my: 2 }} />
            
            <Stack direction="row" justifyContent="space-between" mb={3}>
              <Typography variant="h6">Estimated Total</Typography>
              <Typography variant="h6">${finalTotal.toFixed(2)}</Typography>
            </Stack>

            <Button variant="contained" color="primary" fullWidth size="large" component={RouterLink} to="/checkout">Proceed to Checkout</Button>
          </Paper>
        </Grid>
      </Grid>
      
      <Stack direction="row" justifyContent="space-between" sx={{ mt: 4 }}>
        <Button component={RouterLink} to="/products" color="inherit">Continue Shopping</Button>
        <Button onClick={clearCart} color="inherit" size="small">Clear Cart</Button>
      </Stack>
    </Container>
  );
};

export default CartPage;