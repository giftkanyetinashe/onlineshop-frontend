// src/pages/ProductDetail.jsx

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useParams, Link as RouterLink } from 'react-router-dom';
import {
  Container, Grid, Typography, Button, Box, CircularProgress, Alert,
  Stack, Divider, Chip, Accordion, AccordionSummary, AccordionDetails,
  Breadcrumbs, useTheme, Rating, Paper, TextField, Avatar, Tooltip, IconButton
} from '@mui/material';
import {
  ShoppingBagOutlined, CheckCircleOutline, ExpandMore, Star,

} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../services/api';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';

// --- Skeleton Loader (Unchanged) ---
const ProductSkeleton = () => (
    <Grid container spacing={6}>
        <Grid item xs={12} md={7}><Box sx={{ bgcolor: 'grey.200', borderRadius: 3, width: '100%', aspectRatio: '1 / 1' }} /></Grid>
        <Grid item xs={12} md={5}><Stack spacing={3}><Box sx={{ height: 20, bgcolor: 'grey.200', width: '30%' }} /><Box sx={{ height: 48, bgcolor: 'grey.200', width: '90%' }} /><Box sx={{ height: 24, bgcolor: 'grey.200', width: '60%' }} /><Box sx={{ height: 36, bgcolor: 'grey.200', width: '40%' }} /><Divider /><Box sx={{ height: 80, bgcolor: 'grey.200', width: '100%' }} /><Box sx={{ height: 56, bgcolor: 'grey.200', width: '100%' }} /></Stack></Grid>
    </Grid>
);

// --- The World-Class Product Detail Page ---
const ProductDetail = () => {
  // All state and hooks remain the same
  const { slug } = useParams();
  const theme = useTheme();
  const {isAuthenticated } = useAuth();
  const { addToCart, showCartNotification, cart } = useCart();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedSize, setSelectedSize] = useState('');
  const [selectedVariant, setSelectedVariant] = useState(null);
  const [currentImage, setCurrentImage] = useState('');
  const [quantity] = useState(1);
  const [isAdding, setIsAdding] = useState(false);
  const [justAdded, setJustAdded] = useState(false);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewTitle, setReviewTitle] = useState('');
  const [reviewComment, setReviewComment] = useState('');
  const [reviewError, setReviewError] = useState('');
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);

  const fetchProduct = useCallback(async () => {
    // This function remains the same
    try {
      setLoading(true);
      const response = await api.get(`/products/products/${slug}/`);
      const productData = response.data;
      setProduct(productData);
      
      if (productData.variants?.length > 0) {
        const firstSize = productData.variants[0].size;
        setSelectedSize(firstSize);
        const firstAvailableVariant = productData.variants.find(v => v.size === firstSize && v.stock > 0) || productData.variants.find(v => v.size === firstSize);
        setSelectedVariant(firstAvailableVariant);
        setCurrentImage(firstAvailableVariant?.variant_image || productData.images?.[0]?.image || '');
      } else if (productData.images?.length > 0) {
        setCurrentImage(productData.images[0].image);
      }
    } catch (err) {
      setError('We couldn\'t find the product you were looking for.');
    } finally {
      setLoading(false);
    }
  }, [slug]);

  useEffect(() => {
    fetchProduct();
  }, [fetchProduct]);

  // All memoized logic and event handlers remain the same
  const variantsBySize = useMemo(() => {
    if (!product?.variants) return {};
    return product.variants.reduce((acc, variant) => {
      const size = variant.size || 'Default';
      (acc[size] = acc[size] || []).push(variant);
      return acc;
    }, {});
  }, [product]);

  const availableSizes = Object.keys(variantsBySize);
  const shadesForSelectedSize = variantsBySize[selectedSize] || [];

  const handleSizeSelect = (size) => {
    setSelectedSize(size);
    const newVariant = variantsBySize[size].find(v => v.stock > 0) || variantsBySize[size][0];
    setSelectedVariant(newVariant);
  };
  
  const handleShadeSelect = (variant) => {
    setSelectedVariant(variant);
    if (variant.variant_image) setCurrentImage(variant.variant_image);
  };

  const handleAddToCart = () => {
    if (isAdding || justAdded || !selectedVariant) return;
    setIsAdding(true);
    addToCart(product, selectedVariant, quantity);
    setTimeout(() => {
      setIsAdding(false);
      setJustAdded(true);
      showCartNotification(`${product.name} has been added to your bag.`);
      setTimeout(() => setJustAdded(false), 2000);
    }, 500);
  };
  
  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (!reviewTitle || !reviewComment) return setReviewError("A title and comment are required.");
    setIsSubmittingReview(true);
    setReviewError('');
    try {
      const payload = { rating: reviewRating, title: reviewTitle, comment: reviewComment };
      await api.post(`/products/products/${slug}/reviews/`, payload);
      setReviewRating(5); setReviewTitle(''); setReviewComment('');
      fetchProduct();
    } catch (err) {
      setReviewError(err.response?.data?.detail || "You have already reviewed this product.");
    } finally {
      setIsSubmittingReview(false);
    }
  };

  const isInCart = cart.some(item => item.variant?.id === selectedVariant?.id);
  const averageRating = product?.reviews?.length ? product.reviews.reduce((acc, r) => acc + r.rating, 0) / product.reviews.length : 0;
  
  // --- NEW: A clear, readable flag to check for a discount ---
  const hasDiscount = selectedVariant && selectedVariant.discount_price && parseFloat(selectedVariant.discount_price) < parseFloat(selectedVariant.price);


  if (loading) return <Container maxWidth="xl" sx={{ my: 8 }}><ProductSkeleton /></Container>;
  if (error) return <Container maxWidth="sm" sx={{ my: 8, textAlign: 'center' }}><Alert severity="error">{error}</Alert></Container>;
  if (!product) return null;

  return (
    <Box>
      <Container maxWidth="xl" sx={{ mt: 4 }}>
        <Breadcrumbs aria-label="breadcrumb" sx={{ mb: 4 }}>
          <RouterLink to="/" style={{textDecoration: 'none', color: 'inherit'}}>Home</RouterLink>
          <RouterLink to="/products" style={{textDecoration: 'none', color: 'inherit'}}>Shop</RouterLink>
          <Typography color="text.primary">{product.name}</Typography>
        </Breadcrumbs>

        <Grid container spacing={{ xs: 4, md: 8 }}>
          {/* --- Image Gallery (Unchanged) --- */}
          <Grid item xs={12} md={7}>
            <Paper elevation={0} sx={{ position: 'sticky', top: 100, border: `1px solid ${theme.palette.divider}`, borderRadius: 4, p: 1 }}>
              <Box sx={{ overflow: 'hidden', borderRadius: 3, aspectRatio: '1/1' }}>
                <AnimatePresence>
                    <motion.img key={currentImage} src={currentImage} alt={product.name} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.3 }} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
                </AnimatePresence>
              </Box>
              <Stack direction="row" spacing={1.5} mt={1.5}>
                {product.images.map((img) => (
                  <Box key={img.id} component="img" src={img.image} onClick={() => setCurrentImage(img.image)} sx={{ width: 80, height: 80, borderRadius: 2, cursor: 'pointer', border: `2px solid ${currentImage === img.image ? theme.palette.primary.main : 'transparent'}` }} />
                ))}
              </Stack>
            </Paper>
          </Grid>

          {/* --- Product Details (Main section with changes) --- */}
          <Grid item xs={12} md={5}>
            <Stack spacing={3}>
              <Box>
                <Typography variant="body2" color="text.secondary" fontWeight={500} sx={{ textTransform: 'uppercase', letterSpacing: '1px' }}>{product.brand}</Typography>
                <Typography variant="h3" component="h1" sx={{ fontFamily: "'Laginchy', serif", fontSize: { xs: '2.2rem', sm: '2.8rem' } }}>{product.name}</Typography>
                <Typography variant="h6" color="text.secondary" fontWeight={400} sx={{ mt: 1 }}>{product.tagline}</Typography>
                <Stack direction="row" alignItems="center" spacing={1} mt={1.5}>
                  <Rating value={averageRating} precision={0.5} readOnly emptyIcon={<Star sx={{ opacity: 0.5 }} />} />
                  <Typography variant="body2" color="text.secondary">({product.reviews.length} reviews)</Typography>
                </Stack>
              </Box>
              
              {/*
              // =================================================================
              // === THIS ENTIRE BLOCK IS THE WORLD-CLASS UPGRADE FOR PRICING ===
              // =================================================================
              */}
              <Box>
                {hasDiscount ? (
                  <Stack direction="row" spacing={2} alignItems="center">
                    <Typography variant="h4" fontWeight={700} color="error.main" sx={{ fontFamily: "'Laginchy', serif" }}>
                      ${selectedVariant.discount_price}
                    </Typography>
                    <Typography variant="h5" sx={{ textDecoration: 'line-through', color: 'text.secondary', fontFamily: "'Laginchy', serif" }}>
                      ${selectedVariant.price}
                    </Typography>
                    <Chip
                      label={`${Math.round((1 - selectedVariant.discount_price / selectedVariant.price) * 100)}% OFF`}
                      color="error"
                      size="small"
                      sx={{ fontWeight: 'bold' }}
                    />
                  </Stack>
                ) : (
                  <Typography variant="h4" fontWeight={500} sx={{ fontFamily: "'Laginchy', serif" }}>
                    ${selectedVariant?.price || product.display_price}
                  </Typography>
                )}
              </Box>
              {/* ================================================================= */}
              
              <Stack direction="row" spacing={1} flexWrap="wrap">
                {product.skin_types?.split(',').map(type => type.trim() && <Chip key={type} label={type} size="small" />)}
                {product.tags?.map(tag => <Chip key={tag.id} label={tag.name} size="small" variant="outlined" />)}
              </Stack>

              <Divider />

              {/* Size Selector (Unchanged) */}
              {availableSizes.length > 1 && (
                  <Stack spacing={1.5}>
                      <Typography variant="subtitle1" fontWeight="500">Select Size</Typography>
                      <Stack direction="row" spacing={1} flexWrap="wrap">
                          {availableSizes.map(size => (
                              <Chip key={size} label={size} onClick={() => handleSizeSelect(size)} variant={selectedSize === size ? 'filled' : 'outlined'} color={selectedSize === size ? 'primary' : 'default'} sx={{ cursor: 'pointer' }}/>
                          ))}
                      </Stack>
                  </Stack>
              )}

              {/* Shade Selector (Unchanged) */}
              {shadesForSelectedSize.length > 0 && shadesForSelectedSize[0].shade_name && (
                  <Stack spacing={1.5}>
                      <Typography variant="subtitle1" fontWeight="500">Shade: <Box component="span" fontWeight={400}>{selectedVariant?.shade_name}</Box></Typography>
                      <Stack direction="row" spacing={1} flexWrap="wrap">
                          {shadesForSelectedSize.map(variant => (
                              <Tooltip title={variant.shade_name} key={variant.id} placement="top">
                                  <IconButton onClick={() => handleShadeSelect(variant)} sx={{ width: 40, height: 40, p: 0.5, border: `2px solid ${selectedVariant?.id === variant.id ? theme.palette.primary.main : 'transparent'}`, opacity: variant.stock === 0 ? 0.4 : 1 }}>
                                      <Box sx={{ width: '100%', height: '100%', borderRadius: '50%', bgcolor: variant.shade_hex_color || '#ccc', border: '1px solid rgba(0,0,0,0.1)' }} />
                                  </IconButton>
                              </Tooltip>
                          ))}
                      </Stack>
                  </Stack>
              )}
              
              {/* Add to Cart Panel (Unchanged) */}
              <Paper variant='outlined' sx={{ p: 2, borderRadius: 3 }}>
                  <Button variant="contained" size="large" fullWidth onClick={handleAddToCart} disabled={!selectedVariant || selectedVariant.stock === 0 || isAdding || justAdded || isInCart} sx={{ py: 1.5, '&.Mui-disabled': { bgcolor: isInCart ? 'success.light' : 'grey.300' }}}>
                      <AnimatePresence mode="wait">
                          {isAdding ? <CircularProgress size={24} color="inherit" /> : justAdded || isInCart ? <><CheckCircleOutline /> In Your Bag</> : <><ShoppingBagOutlined /> Add to Bag</>}
                      </AnimatePresence>
                  </Button>
              </Paper>
              
              {/* Accordion for Details (Unchanged) */}
              <Box>
                  <Accordion defaultExpanded elevation={0} disableGutters sx={{ bgcolor: 'transparent', '&:before': { display: 'none' } }}><AccordionSummary expandIcon={<ExpandMore />}><Typography fontWeight="500">Description</Typography></AccordionSummary><AccordionDetails><Typography color="text.secondary" sx={{ whiteSpace: 'pre-wrap' }}>{product.description}</Typography></AccordionDetails></Accordion>
                  <Accordion elevation={0} disableGutters sx={{ bgcolor: 'transparent', '&:before': { display: 'none' } }}><AccordionSummary expandIcon={<ExpandMore />}><Typography fontWeight="500">How to Use</Typography></AccordionSummary><AccordionDetails><Typography color="text.secondary" sx={{ whiteSpace: 'pre-wrap' }}>{product.how_to_use}</Typography></AccordionDetails></Accordion>
                  <Accordion elevation={0} disableGutters sx={{ bgcolor: 'transparent', '&:before': { display: 'none' } }}><AccordionSummary expandIcon={<ExpandMore />}><Typography fontWeight="500">Ingredients</Typography></AccordionSummary><AccordionDetails><Typography color="text.secondary">{product.ingredients}</Typography></AccordionDetails></Accordion>
              </Box>
            </Stack>
          </Grid>
        </Grid>
      </Container>
      
      {/* --- Full-width Reviews Section (Unchanged) --- */}
      <Box sx={{ bgcolor: 'background.paper', py: 8, mt: 8 }}>
        <Container maxWidth="lg">
            <Typography variant="h4" component="h2" gutterBottom sx={{ fontFamily: "'Laginchy', serif", textAlign: 'center', mb: 4 }}>Real Results from Real People</Typography>
            {product.reviews.length > 0 ? (
                <Grid container spacing={4}>
                    {product.reviews.map(review => (
                        <Grid item xs={12} md={6} key={review.id}>
                            <Paper variant="outlined" sx={{ p: 3, borderRadius: 3, height: '100%' }}>
                                <Stack direction="row" spacing={2} alignItems="center" mb={1}>
                                    <Avatar>{review.user.username[0].toUpperCase()}</Avatar>
                                    <Box><Typography fontWeight="500">{review.user.username}</Typography><Rating value={review.rating} readOnly size="small" /></Box>
                                </Stack>
                                <Typography variant="h6">{review.title}</Typography>
                                <Typography color="text.secondary" sx={{ mt: 1 }}>{review.comment}</Typography>
                            </Paper>
                        </Grid>
                    ))}
                </Grid>
            ) : (
                <Typography color="text.secondary" textAlign="center">This product has no reviews yet. Be the first to leave one!</Typography>
            )}

            {isAuthenticated && (
                <Paper component="form" onSubmit={handleReviewSubmit} elevation={0} sx={{ border: `1px solid ${theme.palette.divider}`, p: {xs: 2, md: 4}, mt: 6, borderRadius: 3, maxWidth: '800px', mx: 'auto' }}>
                    <Typography variant="h6" gutterBottom>Write a Review</Typography>
                    {reviewError && <Alert severity="error" sx={{ mb: 2 }}>{reviewError}</Alert>}
                    <Stack spacing={2}>
                        <Rating value={reviewRating} onChange={(e, newValue) => setReviewRating(newValue)} size="large" />
                        <TextField label="Review Title" value={reviewTitle} onChange={(e) => setReviewTitle(e.target.value)} fullWidth required />
                        <TextField label="Your Thoughts..." value={reviewComment} onChange={(e) => setReviewComment(e.target.value)} multiline rows={4} fullWidth required />
                        <Button type="submit" variant="contained" disabled={isSubmittingReview} sx={{ alignSelf: 'flex-start' }}>
                            {isSubmittingReview ? <CircularProgress size={24} /> : 'Submit Review'}
                        </Button>
                    </Stack>
                </Paper>
            )}
        </Container>
      </Box>
    </Box>
  );
};

export default ProductDetail;