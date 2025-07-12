import React from 'react';
import { Box, Chip, Typography, useTheme } from '@mui/material';

const CategoryFilter = ({ selectedCategory, onChange, categories = [], sx }) => {
  const theme = useTheme();

  // In a real app, you would fetch these from your API
  const defaultCategories = [
    { id: 1, name: 'All', slug: 'all' },
    { id: 2, name: 'Electronics', slug: 'electronics' },
    { id: 3, name: 'Clothing', slug: 'clothing' },
    { id: 4, name: 'Home', slug: 'home' },
    { id: 5, name: 'Beauty', slug: 'beauty' },
  ];

  const displayCategories = categories.length > 0 ? categories : defaultCategories;

  return (
    <Box sx={{ ...sx }}>
      <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 600 }}>
        Filter by Category:
      </Typography>
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
        {displayCategories.map((category) => (
          <Chip
            key={category.id}
            label={category.name}
            clickable
            onClick={() => onChange(category.id === 1 ? null : category.id)}
            variant={selectedCategory === category.id || (category.id === 1 && !selectedCategory) ? 'filled' : 'outlined'}
            color="primary"
            sx={{
              px: 2,
              py: 1.5,
              fontSize: '0.9rem',
              backgroundColor: selectedCategory === category.id || (category.id === 1 && !selectedCategory) 
                ? theme.palette.primary.main 
                : 'transparent',
              color: selectedCategory === category.id || (category.id === 1 && !selectedCategory) 
                ? theme.palette.primary.contrastText 
                : theme.palette.text.primary,
              '&:hover': {
                backgroundColor: theme.palette.primary.light,
                color: theme.palette.primary.contrastText
              }
            }}
          />
        ))}
      </Box>
    </Box>
  );
};

export default CategoryFilter;