// src/components/ProductCard.jsx

import React from 'react';
import {
  Card,
  CardMedia,
  CardContent,
  Typography,
  Box,
  Chip,
  IconButton,
  Rating,
  useTheme,
  Stack
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { ShoppingCart, CheckCircle } from '@mui/icons-material';
import { motion } from 'framer-motion';

const ProductCard = ({ product }) => {
  const { addToCart, cart } = useCart();
  const navigate = useNavigate();
  const theme = useTheme();

  // --- World-Class Logic Upgrade ---
  // A product card should always represent the *default* or first available state.
  const defaultVariant = product.variants?.find(v => v.stock > 0) || product.variants?.[0];

  const isInCart = cart.some(item => item.variant?.id === defaultVariant?.id);
  const isOutOfStock = !defaultVariant || defaultVariant.stock === 0;

  // Use the variant's price if it exists, otherwise fall back to the product's display price
  const price = defaultVariant?.price || product.display_price;
  const discountPrice = defaultVariant?.discount_price;
  const hasDiscount = discountPrice && parseFloat(discountPrice) < parseFloat(price);

  // Calculate average rating
  const averageRating = product.reviews?.length
    ? product.reviews.reduce((acc, r) => acc + r.rating, 0) / product.reviews.length
    : 0;

  const handleCardClick = () => {
    navigate(`/products/${product.slug}`);
  };

  const handleActionClick = (e) => {
    e.stopPropagation(); // Prevent card click when clicking the button
    if (isInCart) {
      navigate('/cart');
    } else if (!isOutOfStock) {
      addToCart(product, defaultVariant, 1);
    }
  };

  // Determine the primary image to display
  const displayImage = product.images?.find(img => img.is_default)?.image || product.images?.[0]?.image;

  return (
    <Card
      onClick={handleCardClick}
      component={motion.div}
      whileHover="hover"
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        position: 'relative',
        cursor: 'pointer',
        borderRadius: 3,
        boxShadow: 'none',
        border: `1px solid ${theme.palette.divider}`,
        transition: 'box-shadow 0.3s ease, border-color 0.3s ease',
        '&:hover': {
          boxShadow: theme.shadows[4],
          borderColor: 'transparent'
        },
      }}
    >
      <Box sx={{ position: 'relative', overflow: 'hidden', pt: '100%' /* 1:1 Aspect Ratio */ }}>
        <CardMedia
          //component={motion.img}
          image={displayImage}
          //alt={product.name}
          sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            transition: 'transform 0.4s ease',
          }}
          variants={{
            hover: { scale: 1.05 }
          }}
        />

        {/* --- Badges --- */}
        <Box sx={{ position: 'absolute', top: 12, left: 12, display: 'flex', gap: 1 }}>
          {hasDiscount && (
            <Chip
              label={`${Math.round((1 - discountPrice / price) * 100)}% OFF`}
              color="error"
              size="small"
              sx={{ fontWeight: 'bold' }}
            />
          )}
          {isOutOfStock && (
             <Chip label="Sold Out" color="default" size="small" />
          )}
        </Box>

        {/* --- Hover Action Button --- */}
        <Box
          component={motion.div}
          initial={{ y: 20, opacity: 0 }}
          variants={{
            hover: { y: 0, opacity: 1 }
          }}
          transition={{ duration: 0.3 }}
          sx={{
            position: 'absolute',
            bottom: 12,
            right: 12,
            zIndex: 2,
          }}
        >
          <IconButton
            onClick={handleActionClick}
            disabled={isOutOfStock && !isInCart}
            sx={{
              bgcolor: isInCart ? 'success.main' : 'primary.main',
              color: 'white',
              '&:hover': {
                bgcolor: isInCart ? 'success.dark' : 'primary.dark',
              },
              '&.Mui-disabled': {
                  bgcolor: 'grey.300'
              }
            }}
          >
            {isInCart ? <CheckCircle /> : <ShoppingCart />}
          </IconButton>
        </Box>
      </Box>

      {/* --- Product Details --- */}
      <CardContent sx={{ flexGrow: 1, p: 2 }}>
        <Typography variant="body2" color="text.secondary" gutterBottom>
          {product.brand}
        </Typography>
        <Typography 
            variant="h6" 
            component="h2" 
            sx={{ 
                fontWeight: 600, 
                fontSize: '1rem',
                // Truncate text to 2 lines
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                display: '-webkit-Box',
                WebkitLineClamp: 2,
                WebkitBoxOrient: 'vertical',
                minHeight: '2.5rem' // Reserve space for 2 lines
            }}
        >
          {product.name}
        </Typography>

        <Stack direction="row" alignItems="center" spacing={1} sx={{ mt: 1 }}>
          <Rating value={averageRating} precision={0.5} readOnly size="small" />
          {product.reviews?.length > 0 && (
            <Typography variant="caption" color="text.secondary">
                ({product.reviews.length})
            </Typography>
          )}
        </Stack>
        
        <Box sx={{ mt: 1.5, display: 'flex', alignItems: 'center', gap: 1 }}>
          {hasDiscount ? (
            <>
              <Typography variant="h6" fontWeight="bold" color="error.main">
                ${discountPrice}
              </Typography>
              <Typography variant="body1" sx={{ textDecoration: 'line-through', color: 'text.secondary' }}>
                ${price}
              </Typography>
            </>
          ) : (
            <Typography variant="h6" fontWeight="bold">
              ${price}
            </Typography>
          )}
        </Box>
      </CardContent>
    </Card>
  );
};

export default ProductCard;