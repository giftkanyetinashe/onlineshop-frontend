import React from 'react';
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
  Paper, 
  Button,
  IconButton,
  Grid
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';

const CartPage = () => {
  const { cart, removeFromCart, updateQuantity } = useCart();

  // Function to handle quantity changes
  const handleQuantityChange = (productId, variantId, newQuantity) => {
    if (newQuantity > 0) {
      updateQuantity(productId, variantId, newQuantity);
    }
  };

  // Safe price extraction with fallbacks
  const getPrice = (item) => {
    const variantPrice = Number(item?.variant?.price);
    const discountPrice = Number(item?.product?.discount_price);
    const productPrice = Number(item?.product?.price);

    if (!isNaN(variantPrice) && variantPrice > 0) return variantPrice;
    if (!isNaN(discountPrice) && discountPrice > 0) return discountPrice;
    if (!isNaN(productPrice) && productPrice > 0) return productPrice;

    return 0; // fallback
  };

  // Format price safely
  const formatPrice = (price) => {
    const numericPrice = Number(price);
    return isNaN(numericPrice) ? 'N/A' : numericPrice.toFixed(2);
  };

  // Handle empty cart case
  if (cart.length === 0) {
    return (
      <Container maxWidth="lg">
        <Box my={4} textAlign="center">
          <Typography variant="h4" gutterBottom>
            Your cart is empty
          </Typography>
          <Button 
            variant="contained" 
            color="primary" 
            component={Link} 
            to="/products"
          >
            Continue Shopping
          </Button>
        </Box>
      </Container>
    );
  }

  // Calculate total cart value
  const calculateCartTotal = () => {
    return cart.reduce((total, item) => {
      const price = getPrice(item);
      return total + (price * item.quantity);
    }, 0);
  };

  const formattedCartTotal = formatPrice(calculateCartTotal());

  return (
    <Container maxWidth="lg">
      <Box my={4}>
        <Typography variant="h4" gutterBottom>
          Shopping Cart
        </Typography>
        
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Product</TableCell>
                <TableCell>Price</TableCell>
                <TableCell>Quantity</TableCell>
                <TableCell>Total</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {cart.map((item) => {
                const price = getPrice(item);
                const itemTotal = price * item.quantity;
                
                return (
                  <TableRow key={`${item.product.id}-${item.variant.id}`}>
                    <TableCell>
                      <Box display="flex" alignItems="center">
                        <img 
                          src={item.product.images?.[0]?.image} 
                          alt={item.product.name} 
                          style={{ 
                            width: 50, 
                            height: 50, 
                            marginRight: 16,
                            objectFit: 'cover'
                          }}
                        />
                        <div>
                          <Typography>{item.product.name}</Typography>
                          <Typography variant="body2" color="text.secondary">
                            {item.variant.color} - {item.variant.size}
                          </Typography>
                        </div>
                      </Box>
                    </TableCell>
                    <TableCell>
                      ${formatPrice(price)}
                    </TableCell>
                    <TableCell>
                      <Box display="flex" alignItems="center">
                        <Button 
                          size="small" 
                          onClick={() => handleQuantityChange(
                            item.product.id, 
                            item.variant.id, 
                            item.quantity - 1
                          )}
                          disabled={item.quantity <= 1}
                        >
                          -
                        </Button>
                        <Typography mx={1}>{item.quantity}</Typography>
                        <Button 
                          size="small" 
                          onClick={() => handleQuantityChange(
                            item.product.id, 
                            item.variant.id, 
                            item.quantity + 1
                          )}
                        >
                          +
                        </Button>
                      </Box>
                    </TableCell>
                    <TableCell>
                      ${formatPrice(itemTotal)}
                    </TableCell>
                    <TableCell>
                      <IconButton 
                        onClick={() => removeFromCart(item.product.id, item.variant.id)}
                        color="error"
                      >
                        <DeleteIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>
        
        <Box mt={4}>
          <Grid container justifyContent="flex-end">
            <Grid item xs={12} md={4}>
              <Box p={2} border={1} borderColor="divider" borderRadius={2}>
                <Typography variant="h6" gutterBottom>
                  Order Summary
                </Typography>
                <Box display="flex" justifyContent="space-between" mb={2}>
                  <Typography>Subtotal:</Typography>
                  <Typography>${formattedCartTotal}</Typography>
                </Box>
                <Box display="flex" justifyContent="space-between" mb={2}>
                  <Typography>Shipping:</Typography>
                  <Typography>Free</Typography>
                </Box>
                <Box display="flex" justifyContent="space-between" mb={2}>
                  <Typography variant="h6">Total:</Typography>
                  <Typography variant="h6">${formattedCartTotal}</Typography>
                </Box>
                <Button 
                  variant="contained" 
                  color="primary" 
                  fullWidth
                  component={Link}
                  to="/checkout"
                  size="large"
                  disabled={cart.length === 0}
                >
                  Proceed to Checkout
                </Button>
              </Box>
            </Grid>
          </Grid>
        </Box>
      </Box>
    </Container>
  );
};

export default CartPage;
