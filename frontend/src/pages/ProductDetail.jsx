import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { 
  Container, Grid, Typography, Button, Select, MenuItem, FormControl, 
  Box, CircularProgress, Alert, Stack, Divider, Chip, Accordion,
  AccordionSummary, AccordionDetails, Breadcrumbs, useTheme
} from '@mui/material';
// Icons
import ShoppingBagOutlinedIcon from '@mui/icons-material/ShoppingBagOutlined';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import LocalShippingOutlinedIcon from '@mui/icons-material/LocalShippingOutlined';
import VerifiedUserOutlinedIcon from '@mui/icons-material/VerifiedUserOutlined';

import { motion, AnimatePresence } from 'framer-motion';
import api from '../services/api';
import { useCart } from '../context/CartContext';

// Skeleton Loader with the corrected breakpoint
const ProductSkeleton = () => (
    <Grid container spacing={6}>
      <Grid item xs={12} sm={7} order={{ xs: 1, sm: 2 }}> {/* <<<<< FIX: md to sm */}
        <Box sx={{ bgcolor: 'grey.200', borderRadius: 2, width: '100%', height: { xs: 400, sm: 600 } }} />
        <Stack direction="row" spacing={2} mt={2}>
          <Box sx={{ bgcolor: 'grey.200', borderRadius: 1, width: 70, height: 70 }} />
          <Box sx={{ bgcolor: 'grey.200', borderRadius: 1, width: 70, height: 70 }} />
          <Box sx={{ bgcolor: 'grey.200', borderRadius: 1, width: 70, height: 70 }} />
        </Stack>
      </Grid>
      <Grid item xs={12} sm={5} order={{ xs: 2, sm: 1 }}> {/* <<<<< FIX: md to sm */}
        <Box sx={{ height: 18, bgcolor: 'grey.200', mb: 3, width: '50%' }} />
        <Box sx={{ height: 48, bgcolor: 'grey.200', mb: 2, width: '90%' }} />
        <Box sx={{ height: 36, bgcolor: 'grey.200', mb: 4, width: '40%' }} />
        <Box sx={{ height: 60, bgcolor: 'grey.200', mb: 4, width: '100%' }} />
        <Box sx={{ height: 56, bgcolor: 'grey.200', width: '100%' }} />
        <Box sx={{ height: 40, bgcolor: 'grey.200', mt: 4, width: '100%' }} />
      </Grid>
    </Grid>
);


const ProductDetail = () => {
  // All hooks and state declarations remain the same
  const { slug } = useParams();
  const theme = useTheme();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedVariant, setSelectedVariant] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [currentImage, setCurrentImage] = useState('');
  const [isAdding, setIsAdding] = useState(false);
  const [justAdded, setJustAdded] = useState(false);
  const { addToCart, showCartNotification } = useCart();
  
  // All functions (useEffect, handleVariantSelect, etc.) remain the same
  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        const response = await api.get(`/products/products/${slug}/`);
        const productData = response.data;
        setProduct(productData);
        if (productData.variants?.length > 0) {
          const initialVariant = productData.variants.find(v => v.stock > 0) || productData.variants[0];
          setSelectedVariant(initialVariant);
          setCurrentImage(initialVariant.variant_image || productData.images?.[0]?.image || '');
        } else if (productData.images?.length > 0) {
          setCurrentImage(productData.images[0].image);
        }
        setLoading(false);
      } catch (err) {
        setError('We couldn\'t find the product you were looking for.');
        setLoading(false);
      }
    };
    fetchProduct();
  }, [slug]);

  const handleVariantSelect = (variant) => {
    setSelectedVariant(variant);
    if (variant.variant_image) {
      setCurrentImage(variant.variant_image);
    }
  };

  const handleAddToCart = () => {
    if (isAdding || justAdded) return;
    setIsAdding(true);
    const itemToAdd = selectedVariant ? { ...product, id: selectedVariant.id } : product;
    const variantDetails = selectedVariant || null;
    addToCart(itemToAdd, variantDetails, quantity);
    setTimeout(() => {
      setIsAdding(false);
      setJustAdded(true);
      showCartNotification(`${product.name} has been added to your bag.`);
      setTimeout(() => setJustAdded(false), 2000);
    }, 500);
  };
  
  const StockIndicator = () => {
    if (!selectedVariant || selectedVariant.stock > 10) {
      return <Typography variant="body2" sx={{ color: theme.palette.primary.main }}>In Stock</Typography>;
    }
    if (selectedVariant.stock > 0) {
      return <Typography variant="body2" sx={{ color: theme.palette.error.main }}>Low Stock - Only {selectedVariant.stock} left!</Typography>;
    }
    return <Typography variant="body2" color="error">Out of Stock</Typography>;
  };
  
  if (loading) return <Container maxWidth="lg" sx={{ my: { xs: 4, sm: 8 } }}><ProductSkeleton /></Container>;
  
  if (error) {
    return (
      <Container maxWidth="sm" sx={{ my: 8, textAlign: 'center' }}>
        <Alert severity="error">{error}</Alert>
        <Button component={Link} to="/shop" variant="contained" sx={{ mt: 3 }}>
          Explore Products
        </Button>
      </Container>
    );
  }
  
  if (!product) return null;

  return (
    <Container maxWidth="lg">
      <Box my={{ xs: 4, sm: 8 }}>
        <Grid container spacing={{ xs: 4, sm: 8 }}>
          
          {/* --- Image Gallery Column --- */}
          <Grid item xs={12} md={7} order={{ xs: 2, md: 1 }}> {/* <<<<< FIX: Changed 'md' to 'sm' */}
            <Box sx={{ position: 'sticky', top: '100px' }}>
              <Box sx={{ overflow: 'hidden', borderRadius: '8px', border: `1px solid ${theme.palette.blush}` }}>
                <Box 
                  component="img" src={currentImage} alt={product.name}
                  sx={{ 
                    width: '100%', height: 'auto', aspectRatio: '1/1', display: 'block',
                    objectFit: 'cover', transition: 'transform 0.5s ease', '&:hover': { transform: 'scale(1.1)' }
                  }}
                />
              </Box>
              <Stack direction="row" spacing={1.5} mt={2}>
                {product.images.map((img) => (
                  <Box
                    key={img.id} component="img" src={img.image} onClick={() => setCurrentImage(img.image)}
                    sx={{
                      width: 70, height: 70, borderRadius: '4px', cursor: 'pointer',
                      border: `2px solid ${currentImage === img.image ? theme.palette.primary.main : 'transparent'}`,
                      transition: 'border-color 0.3s ease', objectFit: 'cover'
                    }}
                  />
                ))}
              </Stack>
            </Box>
          </Grid>
          
          {/* --- Product Details Column --- */}
          <Grid item xs={12} md={5} order={{ xs: 1, md: 2 }}> {/* <<<<< FIX: Changed 'md' to 'sm' */}
            <Stack spacing={3}>
              <Breadcrumbs separator="›" aria-label="breadcrumb" sx={{ color: 'text.secondary' }}>
                <Link to="/shop" style={{textDecoration: 'none', color: 'inherit'}}>Shop</Link>
                <Typography color="text.primary">{product.name}</Typography>
              </Breadcrumbs>
              
              <Typography variant="h3" component="h1">{product.name}</Typography>
              
              <Stack direction="row" spacing={2} alignItems="center">
                <Typography variant="h5" sx={{ color: product.discount_price ? theme.palette.error.main : 'text.primary' }}>
                  ${product.discount_price || product.price}
                </Typography>
                {product.discount_price && <Typography variant="h6" sx={{ textDecoration: 'line-through', color: 'text.secondary' }}>${product.price}</Typography>}
              </Stack>
              
              <Divider sx={{ borderColor: theme.palette.blush }} />

              <Stack spacing={1.5}>
                <Typography variant="body1" fontWeight="500">Select Option</Typography>
                <Stack direction="row" spacing={1} flexWrap="wrap">
                  {product.variants.map((variant) => (
                    <Chip
                      key={variant.id} label={variant.size || variant.color}
                      onClick={() => handleVariantSelect(variant)} disabled={variant.stock === 0}
                      color={selectedVariant?.id === variant.id ? 'primary' : 'default'}
                      variant={selectedVariant?.id === variant.id ? 'filled' : 'outlined'}
                    />
                  ))}
                </Stack>
              </Stack>

              <Stack direction="row" justifyContent="space-between" alignItems="center">
                <FormControl variant="outlined" sx={{ minWidth: 100 }}>
                  <Select value={quantity} onChange={(e) => setQuantity(e.target.value)}>
                    {[...Array(Math.min(10, selectedVariant?.stock || 10)).keys()].map(num => <MenuItem key={num+1} value={num+1}>{num+1}</MenuItem>)}
                  </Select>
                </FormControl>
                <StockIndicator />
              </Stack>
                
              <Button
                variant="contained" color="primary" size="large" fullWidth onClick={handleAddToCart}
                disabled={selectedVariant?.stock === 0 || isAdding || justAdded}
                sx={{ py: 1.5, height: 56, transition: 'background-color 0.3s' }}
              >
                <AnimatePresence mode="wait">
                  {justAdded ? (
                    <motion.div key="added" initial={{y: -20, opacity: 0}} animate={{y: 0, opacity: 1}} exit={{y: 20, opacity: 0}}><Stack direction="row" alignItems="center" spacing={1}><CheckCircleOutlineIcon/> Added to Bag</Stack></motion.div>
                  ) : isAdding ? (
                    <motion.div key="adding" initial={{y: -20, opacity: 0}} animate={{y: 0, opacity: 1}} exit={{y: 20, opacity: 0}}><CircularProgress size={24} color="inherit" /></motion.div>
                  ) : (
                    <motion.div key="default" initial={{y: -20, opacity: 0}} animate={{y: 0, opacity: 1}} exit={{y: 20, opacity: 0}}><Stack direction="row" alignItems="center" spacing={1}><ShoppingBagOutlinedIcon/> Add to Bag</Stack></motion.div>
                  )}
                </AnimatePresence>
              </Button>

              <Box pt={2}>
                <Accordion defaultExpanded elevation={0} disableGutters sx={{ bgcolor: 'transparent' }}>
                  <AccordionSummary expandIcon={<ExpandMoreIcon />}><Typography fontWeight="500">Description</Typography></AccordionSummary>
                  <AccordionDetails><Typography color="text.secondary">{product.description}</Typography></AccordionDetails>
                </Accordion>
                <Accordion elevation={0} disableGutters sx={{ bgcolor: 'transparent' }}>
                  <AccordionSummary expandIcon={<ExpandMoreIcon />}><Typography fontWeight="500">Ingredients & Usage</Typography></AccordionSummary>
                  <AccordionDetails><Typography color="text.secondary">Full list of ingredients and how to best use this product for optimal results.</Typography></AccordionDetails>
                </Accordion>
              </Box>

              <Stack direction="row" spacing={3} pt={2} sx={{ color: 'text.secondary' }}>
                  <Stack direction="row" alignItems="center" spacing={1}><LocalShippingOutlinedIcon fontSize="small"/> <Typography variant="caption">Free Shipping Over $50</Typography></Stack>
                  <Stack direction="row" alignItems="center" spacing={1}><VerifiedUserOutlinedIcon fontSize="small"/> <Typography variant="caption">Secure Payments</Typography></Stack>
              </Stack>
            </Stack>
          </Grid>
        </Grid>
      </Box>
    </Container>
  );
};

export default ProductDetail;