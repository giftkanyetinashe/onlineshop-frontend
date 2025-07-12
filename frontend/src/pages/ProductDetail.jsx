import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Container, Grid, Typography, Button, Select, MenuItem, FormControl, InputLabel, Box } from '@mui/material';
import api from '../services/api';
import { useCart } from '../context/CartContext';

const ProductDetail = () => {
  const { slug } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedVariant, setSelectedVariant] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [currentImage, setCurrentImage] = useState(null);
  const { addToCart } = useCart();

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const response = await api.get(`/products/products/${slug}/`);
        setProduct(response.data);
        if (response.data.variants.length > 0) {
          setSelectedVariant(response.data.variants[0]);
          // Set initial image to the first variant's image or default product image
          setCurrentImage(
            response.data.variants[0].variant_image || 
            (response.data.images.length > 0 ? response.data.images[0].image : null)
          );
        } else if (response.data.images.length > 0) {
          setCurrentImage(response.data.images[0].image);
        }
        setLoading(false);
      } catch (err) {
        setError('Product not found');
        setLoading(false);
      }
    };

    fetchProduct();
  }, [slug]);

  const handleVariantChange = (variantId) => {
    const variant = product.variants.find(v => v.id === variantId);
    setSelectedVariant(variant);
    // Update the image when variant changes
    setCurrentImage(variant.variant_image || 
      (product.images.length > 0 ? product.images[0].image : null)
    );
  };

  const handleAddToCart = () => {
    if (selectedVariant) {
      addToCart(product, selectedVariant, quantity);
    }
  };

  if (loading) {
    return <Typography>Loading...</Typography>;
  }

  if (error) {
    return <Typography color="error">{error}</Typography>;
  }

  if (!product) {
    return <Typography>Product not found</Typography>;
  }

  return (
    <Container maxWidth="lg">
      <Box my={4}>
        <Grid container spacing={4}>
          <Grid item xs={12} md={6}>
            <Box>
              {currentImage && (
                <img
                  src={currentImage}
                  alt={product.name}
                  style={{ width: '100%', maxHeight: '500px', objectFit: 'contain' }}
                />
              )}
            </Box>
          </Grid>
          <Grid item xs={12} md={6}>
            <Typography variant="h3" component="h1" gutterBottom>
              {product.name}
            </Typography>
            <Typography variant="h5" gutterBottom>
              {product.discount_price ? (
                <>
                  <span style={{ textDecoration: 'line-through', color: 'gray', marginRight: '8px' }}>
                    ${product.price}
                  </span>
                  <span style={{ color: 'red' }}>${product.discount_price}</span>
                </>
              ) : (
                `$${product.price}`
              )}
            </Typography>
            <Typography variant="body1" paragraph>
              {product.description}
            </Typography>
            
            {product.variants.length > 0 && (
              <>
                <FormControl fullWidth margin="normal">
                  <InputLabel>Color</InputLabel>
                  <Select
                    value={selectedVariant?.id || ''}
                    onChange={(e) => handleVariantChange(e.target.value)}
                  >
                    {product.variants.map((variant) => (
                      <MenuItem key={variant.id} value={variant.id}>
                        {variant.color} - {variant.size} ({variant.stock} available)
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
                
                <FormControl fullWidth margin="normal">
                  <InputLabel>Quantity</InputLabel>
                  <Select
                    value={quantity}
                    onChange={(e) => setQuantity(e.target.value)}
                  >
                    {[...Array(10).keys()].map((num) => (
                      <MenuItem key={num + 1} value={num + 1}>
                        {num + 1}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
                
                <Button
                  variant="contained"
                  color="primary"
                  size="large"
                  onClick={handleAddToCart}
                  disabled={!selectedVariant || selectedVariant.stock === 0}
                  style={{ marginTop: '16px' }}
                >
                  Add to Cart
                </Button>
              </>
            )}
          </Grid>
        </Grid>
      </Box>
    </Container>
  );
};

export default ProductDetail;