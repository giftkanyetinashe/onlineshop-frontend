import React from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { useCart } from '../context/CartContext';

// Import all necessary components and hooks
import { 
  Container, 
  Typography, 
  Box, 
  Table, 
  TableBody, 
  TableCell, 
  TableContainer, 
  TableHead, 
  TableRow, 
  Button,
  IconButton,
  Grid,
  Stack,
  Paper, // Used for mobile cards
  useTheme, // To access theme breakpoints
  useMediaQuery // To detect screen size
} from '@mui/material';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';
import ShoppingBagOutlinedIcon from '@mui/icons-material/ShoppingBagOutlined';

// The EmptyCart component remains the same and is already responsive.
const EmptyCart = () => (
  <Container maxWidth="sm">
    <Box my={8} textAlign="center" display="flex" flexDirection="column" alignItems="center" gap={2}>
      <ShoppingBagOutlinedIcon sx={{ fontSize: '4rem', color: 'text.secondary' }} />
      <Typography variant="h5" component="h1" sx={{ fontFamily: "'Laginchy', serif" }}>
        Your Bag is Empty
      </Typography>
      <Typography color="text.secondary" sx={{ mb: 2 }}>
        Looks like you haven't added anything to your bag yet.
      </Typography>
      <Button 
        variant="contained" 
        color="primary" 
        component={RouterLink} 
        to="/"
        size="large"
      >
        Continue Shopping
      </Button>
    </Box>
  </Container>
);

const CartPage = () => {
  const { cart, removeFromCart, updateQuantity } = useCart();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md')); // TRUE on screens smaller than medium (tablet/mobile)

  const handleQuantityChange = (productId, variantId, newQuantity) => {
    if (newQuantity > 0) {
      updateQuantity(productId, variantId, newQuantity);
    }
  };

  const getPrice = (item) => Number(item?.variant?.price) || Number(item?.product?.discount_price) || Number(item?.product?.price) || 0;
  const formatPrice = (price) => `$${Number(price).toFixed(2)}`;
  
  const cartTotal = cart.reduce((total, item) => total + getPrice(item) * item.quantity, 0);

  if (cart.length === 0) {
    return <EmptyCart />;
  }

  // --- Reusable JSX for shared components ---
  const orderSummary = (
    <Box 
      p={{ xs: 2, sm: 3 }} // Responsive padding
      sx={{ 
        backgroundColor: 'background.paper',
        borderRadius: '8px', 
        border: `1px solid ${theme.palette.mode === 'light' ? '#EADAD4' : 'divider'}` // blush border
      }}
    >
      <Typography variant="h6" gutterBottom sx={{ fontFamily: "'Laginchy', serif" }}>
        Order Summary
      </Typography>
      <Stack spacing={2} my={3}>
        <Stack direction="row" justifyContent="space-between">
          <Typography>Subtotal</Typography>
          <Typography>{formatPrice(cartTotal)}</Typography>
        </Stack>
        <Stack direction="row" justifyContent="space-between">
          <Typography>Shipping</Typography>
          <Typography>Calculated at next step</Typography>
        </Stack>
      </Stack>
      <Stack direction="row" justifyContent="space-between" mb={3}>
        <Typography variant="h6">Estimated Total</Typography>
        <Typography variant="h6">{formatPrice(cartTotal)}</Typography>
      </Stack>
      <Button 
        variant="contained" 
        color="primary" 
        fullWidth
        size="large"
        component={RouterLink}
        to="/checkout"
        disabled={cart.length === 0}
      >
        Proceed to Checkout
      </Button>
    </Box>
  );

  return (
    <Container maxWidth="lg" sx={{ my: { xs: 3, md: 6 } }}>
      <Typography variant="h4" component="h1" gutterBottom sx={{ fontFamily: "'Laginchy', serif", textAlign: 'center', mb: { xs: 3, md: 5 } }}>
        Your Bag
      </Typography>
      
      <Grid container spacing={{ xs: 3, md: 5 }}>
        {/* --- MAIN CONTENT: Conditional rendering based on screen size --- */}
        <Grid item xs={12} md={8}>
          {isMobile ? (
            // ===================================
            // MOBILE VIEW: Card-based layout
            // ===================================
            <Stack spacing={3}>
              {cart.map((item) => (
                <Paper key={`${item.product.id}-${item.variant.id}`} variant="outlined" sx={{ p: 2, borderRadius: 2 }}>
                  <Stack direction="row" spacing={2}>
                    <Box
                      component="img"
                      src={item.product.images?.[0]?.image} 
                      alt={item.product.name}
                      sx={{ width: 80, height: 80, borderRadius: '4px', objectFit: 'cover' }}
                    />
                    <Box flexGrow={1}>
                      <Typography variant="body1" fontWeight={500}>{item.product.name}</Typography>
                      <Typography variant="body2" color="text.secondary">{item.variant.name || item.variant.size}</Typography>
                      <Typography variant="body2" fontWeight={500}>{formatPrice(getPrice(item))}</Typography>
                    </Box>
                    <IconButton onClick={() => removeFromCart(item.product.id, item.variant.id)} size="small" sx={{ alignSelf: 'flex-start' }}>
                      <DeleteOutlineIcon fontSize="small" />
                    </IconButton>
                  </Stack>
                  <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mt: 2 }}>
                    <Stack direction="row" alignItems="center" spacing={1}>
                      <IconButton size="small" onClick={() => handleQuantityChange(item.product.id, item.variant.id, item.quantity - 1)}>
                        <RemoveIcon fontSize="small" />
                      </IconButton>
                      <Typography variant="body1" sx={{ px: 1, minWidth: '20px', textAlign: 'center' }}>{item.quantity}</Typography>
                      <IconButton size="small" onClick={() => handleQuantityChange(item.product.id, item.variant.id, item.quantity + 1)}>
                        <AddIcon fontSize="small" />
                      </IconButton>
                    </Stack>
                    <Typography variant="h6">{formatPrice(getPrice(item) * item.quantity)}</Typography>
                  </Stack>
                </Paper>
              ))}
            </Stack>
          ) : (
            // ===================================
            // DESKTOP VIEW: Table-based layout
            // ===================================
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Product</TableCell>
                    <TableCell align="center">Quantity</TableCell>
                    <TableCell align="right">Total</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {cart.map((item) => (
                    <TableRow key={`${item.product.id}-${item.variant.id}`}>
                      <TableCell>
                        <Stack direction="row" spacing={2} alignItems="center">
                          <Box component="img" src={item.product.images?.[0]?.image} alt={item.product.name} sx={{ width: 80, height: 80, borderRadius: '4px', objectFit: 'cover' }} />
                          <Box>
                            <Typography variant="body1" fontWeight={500}>{item.product.name}</Typography>
                            <Typography variant="body2" color="text.secondary">{item.variant.name || item.variant.size}</Typography>
                            <Typography variant="body2" color="text.secondary">{formatPrice(getPrice(item))}</Typography>
                            <IconButton onClick={() => removeFromCart(item.product.id, item.variant.id)} size="small" sx={{ border: 'none', mt: 1, p: 0, '&:hover': { color: 'primary.main', backgroundColor: 'transparent'} }}>
                              <DeleteOutlineIcon fontSize="small"/>
                            </IconButton>
                          </Box>
                        </Stack>
                      </TableCell>
                      <TableCell align="center">
                        <Stack direction="row" alignItems="center" justifyContent="center" spacing={1}>
                          <IconButton size="small" onClick={() => handleQuantityChange(item.product.id, item.variant.id, item.quantity - 1)}><RemoveIcon fontSize="small" /></IconButton>
                          <Typography variant="body1" sx={{ px: 1, minWidth: '20px', textAlign: 'center' }}>{item.quantity}</Typography>
                          <IconButton size="small" onClick={() => handleQuantityChange(item.product.id, item.variant.id, item.quantity + 1)}><AddIcon fontSize="small" /></IconButton>
                        </Stack>
                      </TableCell>
                      <TableCell align="right">
                        <Typography variant="body1" fontWeight={500}>{formatPrice(getPrice(item) * item.quantity)}</Typography>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </Grid>
        
        {/* --- ORDER SUMMARY: This grid layout handles responsiveness automatically --- */}
        <Grid item xs={12} md={4}>
          {orderSummary}
        </Grid>
      </Grid>
    </Container>
  );
};

export default CartPage;