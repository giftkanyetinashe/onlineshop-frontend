import React from 'react';
import {
  Card,
  CardMedia,
  CardContent,
  Typography,
  Button,
  CardActions,
  Box,
  Chip,
  IconButton
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { FavoriteBorder, Favorite, ShoppingCart } from '@mui/icons-material';

const ProductCard = ({ product }) => {
  const { addToCart, cart } = useCart();
  const [isFavorite, setIsFavorite] = React.useState(false);
  const navigate = useNavigate();

  const firstVariant = product.variants?.[0];

  const isInCart = cart.some(item =>
    item.product.slug === product.slug &&
    item.variant.id === firstVariant?.id
  );

  const handleAddToCart = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (product.variants && product.variants.length > 0) {
      addToCart(product, product.variants[0], 1);
    }
  };

  const toggleFavorite = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsFavorite(!isFavorite);
  };

  const handleCardClick = () => {
    navigate(`/products/${product.slug}`);
  };

  const defaultImage = product.images?.find(img => img.is_default) || product.images?.[0];
  const displayImage = firstVariant?.variant_image || defaultImage?.image;
  const hasDiscount = product.discount_price && product.discount_price < product.price;

  return (
    <Card
      onClick={handleCardClick}
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        position: 'relative',
        cursor: 'pointer',
        transition: 'transform 0.3s',
        '&:hover': {
          transform: 'translateY(-5px)',
          boxShadow: 3
        }
      }}
    >
      {/* Favorite button */}
      <IconButton
        sx={{
          position: 'absolute',
          top: 8,
          right: 8,
          zIndex: 1,
          color: isFavorite ? 'red' : 'grey.500',
          backgroundColor: 'rgba(255, 255, 255, 0.8)',
          '&:hover': {
            backgroundColor: 'rgba(255, 255, 255, 0.9)'
          }
        }}
        onClick={toggleFavorite}
        aria-label="add to favorites"
      >
        {isFavorite ? <Favorite /> : <FavoriteBorder />}
      </IconButton>

      {/* Discount badge */}
      {hasDiscount && (
        <Chip
          label={`${Math.round((1 - product.discount_price / product.price) * 100)}% OFF`}
          color="error"
          size="small"
          sx={{
            position: 'absolute',
            top: 8,
            left: 8,
            zIndex: 1
          }}
        />
      )}

      {/* Product or Variant image */}
      <CardMedia
        component="img"
        height="200"
        image={displayImage}
        alt={product.name}
        sx={{
          objectFit: 'contain',
          p: 1,
          backgroundColor: '#f5f5f5'
        }}
      />

      {/* Product details */}
      <CardContent sx={{ flexGrow: 1 }}>
        <Typography gutterBottom variant="h6" component="h2" noWrap>
          {product.name}
        </Typography>
        <Typography variant="body2" color="text.secondary" noWrap>
          {product.category?.name}
        </Typography>

        <Box sx={{ mt: 1, display: 'flex', alignItems: 'center' }}>
          <Typography
            variant="h6"
            sx={{
              fontWeight: 'bold',
              color: hasDiscount ? 'error.main' : 'text.primary'
            }}
          >
            ${hasDiscount ? product.discount_price : product.price}
          </Typography>

          {hasDiscount && (
            <Typography
              variant="body2"
              sx={{
                textDecoration: 'line-through',
                color: 'text.secondary',
                ml: 1
              }}
            >
              ${product.price}
            </Typography>
          )}
        </Box>

        {product.variants?.length === 0 && (
          <Typography variant="caption" color="error">
            Out of stock
          </Typography>
        )}
      </CardContent>

      {/* Action buttons */}
      <CardActions sx={{ justifyContent: 'space-between' }}>
        <Button
          size="small"
          color="primary"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            navigate(`/products/${product.slug}`);
          }}
        >
          View Details
        </Button>

        <Button
          size="small"
          color="secondary"
          startIcon={<ShoppingCart />}
          onClick={handleAddToCart}
          disabled={!product.variants || product.variants.length === 0 || isInCart}
          sx={{
            '&.Mui-disabled': {
              backgroundColor: 'success.light',
              color: 'white'
            }
          }}
        >
          {isInCart ? 'Added' : 'Add to Cart'}
        </Button>
      </CardActions>
    </Card>
  );
};

export default ProductCard;
