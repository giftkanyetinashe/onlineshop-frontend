import React, { useState, useEffect } from 'react';
import { 
  Container, Grid, Typography, Box, TextField, CircularProgress,
  Alert, List, ListItem, ListItemText, IconButton, Collapse, Chip,
  Divider, Paper, InputAdornment, Drawer, Button, useMediaQuery
} from '@mui/material';
import { 
  ExpandMore, ExpandLess, Search, Category, 
  Clear, Folder, FolderOpen,FilterAlt, Close 
} from '@mui/icons-material';
import { styled, useTheme } from '@mui/material/styles';
import ProductCard from '../components/ProductCard';
import api from '../services/api';

const CompactCategoryItem = styled(ListItem)(({ theme, level, selected }) => ({
  paddingLeft: theme.spacing(level * 1.5 + 2),
  paddingTop: theme.spacing(0.25),
  paddingBottom: theme.spacing(0.25),
  minHeight: '36px',
  backgroundColor: selected ? theme.palette.action.selected : 'inherit',
  borderRadius: theme.shape.borderRadius,
  '&:hover': {
    backgroundColor: theme.palette.action.hover,
  },
  transition: theme.transitions.create(['background-color', 'padding'], {
    duration: theme.transitions.duration.shortest,
  }),
}));

const ProductList = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState({ products: true, categories: true });
  const [error, setError] = useState(null);
  const [expanded, setExpanded] = useState({});
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [mobileOpen, setMobileOpen] = useState(false);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [visibleCategories, setVisibleCategories] = useState(8); // Number of initially visible categories

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [productsRes, categoriesRes] = await Promise.all([
          api.get('/products/products/'),
          api.get('/products/categories/?tree')
        ]);
        
        setProducts(productsRes.data);
        setCategories(categoriesRes.data.categories || []);
        
        // Expand first level categories by default
        if (categoriesRes.data.categories) {
          const firstLevelExpanded = {};
          categoriesRes.data.categories.slice(0, 3).forEach(cat => {
            firstLevelExpanded[cat.id] = true;
          });
          setExpanded(firstLevelExpanded);
        }
      } catch (err) {
        setError(err.response?.data?.detail || 'Failed to load data');
      } finally {
        setLoading({ products: false, categories: false });
      }
    };

    fetchData();
  }, []);

  const toggleCategory = (categoryId) => {
    setExpanded(prev => ({ ...prev, [categoryId]: !prev[categoryId] }));
  };

  const handleCategorySelect = (category) => {
    setSelectedCategory(prev => prev?.id === category.id ? null : category);
    if (isMobile) setMobileOpen(false);
  };

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = !selectedCategory || product.category?.id === selectedCategory.id;
    return matchesSearch && matchesCategory;
  });

  const countProductsInCategory = (category) => {
    return products.filter(p => p.category?.id === category.id).length;
  };

  const renderCategory = (category) => {
    const isExpanded = expanded[category.id];
    const hasChildren = category.children?.length > 0;
    const productCount = countProductsInCategory(category);
    const isSelected = selectedCategory?.id === category.id;

    return (
      <React.Fragment key={category.id}>
        <CompactCategoryItem
          button
          level={category.level || 0}
          selected={isSelected}
          onClick={() => handleCategorySelect(category)}
        >
          {hasChildren ? (
            isExpanded ? 
              <FolderOpen color={isSelected ? "primary" : "action"} sx={{ mr: 1, fontSize: '1rem' }} /> : 
              <Folder color={isSelected ? "primary" : "action"} sx={{ mr: 1, fontSize: '1rem' }} />
          ) : (
            <Category color={isSelected ? "primary" : "action"} sx={{ mr: 1, fontSize: '1rem' }} />
          )}
          <ListItemText 
            primary={
              <Typography 
                variant="body2" 
                sx={{ 
                  fontWeight: isSelected ? 600 : 400,
                  color: isSelected ? 'primary.main' : 'inherit'
                }}
              >
                {category.name}
              </Typography>
            }
            secondary={productCount > 0 ? `${productCount} items` : null}
            secondaryTypographyProps={{ variant: 'caption' }}
          />
          {hasChildren && (
            <IconButton
              size="small"
              onClick={(e) => {
                e.stopPropagation();
                toggleCategory(category.id);
              }}
            >
              {isExpanded ? <ExpandLess fontSize="small" /> : <ExpandMore fontSize="small" />}
            </IconButton>
          )}
        </CompactCategoryItem>
        {hasChildren && (
          <Collapse in={isExpanded} timeout="auto" unmountOnExit>
            <List component="div" disablePadding dense>
              {category.children.map(renderCategory)}
            </List>
          </Collapse>
        )}
      </React.Fragment>
    );
  };

  const handleShowMoreCategories = () => {
    setVisibleCategories(prev => prev + 10);
  };

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  if (error) {
    return (
      <Container maxWidth="lg">
        <Box my={4}>
          <Alert severity="error">{error}</Alert>
        </Box>
      </Container>
    );
  }

  if (loading.products || loading.categories) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <CircularProgress />
      </Box>
    );
  }

  const drawerContent = (
    <Box sx={{ width: 250, p: 2 }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography variant="h6">Categories</Typography>
        <IconButton onClick={handleDrawerToggle}>
          <Close />
        </IconButton>
      </Box>
      <List dense>
        <ListItem 
          button 
          selected={!selectedCategory}
          onClick={() => handleCategorySelect(null)}
          sx={{
            borderRadius: 1,
            mb: 1,
            '&.Mui-selected': {
              backgroundColor: 'primary.light',
            }
          }}
        >
          <ListItemText 
            primary="All Categories"
            secondary={`${products.length} products`}
            secondaryTypographyProps={{ variant: 'caption' }}
          />
        </ListItem>
        {categories.map(renderCategory)}
      </List>
    </Box>
  );

  return (
    <Container maxWidth="xl" sx={{ py: 3 }}>
      {/* Mobile Filter Button */}
      {isMobile && (
        <Box mb={2}>
          <Button
            variant="outlined"
            startIcon={<FilterAlt />}
            onClick={handleDrawerToggle}
            fullWidth
            sx={{ justifyContent: 'space-between' }}
          >
            Filters
            {selectedCategory && (
              <Chip
                label={selectedCategory.name}
                size="small"
                color="primary"
                sx={{ ml: 1 }}
              />
            )}
          </Button>
        </Box>
      )}

      <Grid container spacing={3}>
        {/* Categories Sidebar - Desktop */}
        {!isMobile && (
          <Grid item xs={12} md={3} lg={2.5}>
            <Paper elevation={0} sx={{ p: 2, borderRadius: 2 }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1 }}>
                Categories
              </Typography>
              <Divider sx={{ my: 1 }} />
              <List dense sx={{ maxHeight: '70vh', overflow: 'auto' }}>
                <ListItem 
                  button 
                  selected={!selectedCategory}
                  onClick={() => handleCategorySelect(null)}
                  sx={{
                    borderRadius: 1,
                    mb: 0.5,
                    '&.Mui-selected': {
                      backgroundColor: 'primary.light',
                    }
                  }}
                >
                  <ListItemText 
                    primary="All Categories"
                    secondary={`${products.length} products`}
                    secondaryTypographyProps={{ variant: 'caption' }}
                  />
                </ListItem>
                {categories.slice(0, visibleCategories).map(renderCategory)}
                {visibleCategories < categories.length && (
                  <Button 
                    size="small" 
                    onClick={handleShowMoreCategories}
                    sx={{ mt: 1, ml: 1 }}
                  >
                    Show more categories
                  </Button>
                )}
              </List>
            </Paper>
          </Grid>
        )}

        {/* Product Listing */}
        <Grid item xs={12} md={9} lg={9.5}>
          <Box mb={3}>
            <TextField
              fullWidth
              variant="outlined"
              placeholder="Search products..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Search color="action" />
                  </InputAdornment>
                ),
                endAdornment: searchTerm && (
                  <InputAdornment position="end">
                    <IconButton
                      size="small"
                      onClick={() => setSearchTerm('')}
                    >
                      <Clear fontSize="small" />
                    </IconButton>
                  </InputAdornment>
                ),
                sx: {
                  borderRadius: 2,
                  backgroundColor: 'background.paper',
                }
              }}
            />
            
            {(selectedCategory || searchTerm) && (
              <Box display="flex" alignItems="center" mt={2} flexWrap="wrap" gap={1}>
                {selectedCategory && (
                  <Chip
                    label={`Category: ${selectedCategory.name}`}
                    onDelete={() => setSelectedCategory(null)}
                    color="primary"
                    size="small"
                  />
                )}
                {searchTerm && (
                  <Chip
                    label={`Search: "${searchTerm}"`}
                    onDelete={() => setSearchTerm('')}
                    color="secondary"
                    size="small"
                  />
                )}
              </Box>
            )}
          </Box>
          
          {filteredProducts.length > 0 ? (
            <Grid container spacing={3}>
              {filteredProducts.map(product => (
                <Grid item key={product.id} xs={6} sm={4} md={4} lg={3} xl={2.4}>
                  <ProductCard product={product} />
                </Grid>
              ))}
            </Grid>
          ) : (
            <Box 
              display="flex" 
              flexDirection="column" 
              alignItems="center" 
              justifyContent="center" 
              minHeight="40vh"
              textAlign="center"
            >
              <Search color="disabled" sx={{ fontSize: 60, mb: 2 }} />
              <Typography variant="h6" color="text.secondary" gutterBottom>
                No products found
              </Typography>
              <Typography variant="body1" color="text.secondary">
                Try adjusting your search or category filters
              </Typography>
            </Box>
          )}
        </Grid>
      </Grid>

      {/* Mobile Drawer */}
      <Drawer
        anchor="left"
        open={mobileOpen}
        onClose={handleDrawerToggle}
        ModalProps={{ keepMounted: true }}
        sx={{
          '& .MuiDrawer-paper': {
            width: 280,
          },
        }}
      >
        {drawerContent}
      </Drawer>
    </Container>
  );
};

export default ProductList;