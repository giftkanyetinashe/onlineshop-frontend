import React, { useState, useEffect, useMemo } from 'react';
import { 
  Container, Grid, Typography, Box, TextField, Alert,
  List, ListItemButton, ListItemText, IconButton, Collapse, Chip,
  Divider, Skeleton, InputAdornment, Drawer, Fab, useTheme, Select, MenuItem, FormControl,
  Stack, Button, Paper
} from '@mui/material';
import { 
  ExpandMore, ExpandLess, Search, Clear, FilterList as FilterIcon, Close, 
  KeyboardArrowLeft, KeyboardArrowRight
} from '@mui/icons-material';
import ProductCard from '../components/ProductCard';
import api from '../services/api';

// --- CONFIGURATION CONSTANTS ---
const SIDEBAR_WIDTH = 280;
const HEADER_HEIGHT = 64; // IMPORTANT: Set this to the actual height of your header in pixels.

// Skeleton loader updated for the new layout
const ShopPageSkeleton = () => (
  <Box sx={{ display: 'flex' }}>
    <Box sx={{ width: SIDEBAR_WIDTH, p: 2, display: { xs: 'none', md: 'block' }, flexShrink: 0 }}>
      <Skeleton variant="text" width="80%" height={40} />
      <Skeleton variant="rectangular" width="100%" height={400} sx={{ mt: 2 }} />
    </Box>
    <Box sx={{ flexGrow: 1, p: 4 }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Skeleton variant="text" width="40%" height={50} />
        <Skeleton variant="rectangular" width={150} height={40} />
      </Box>
      <Grid container spacing={3}>
        {[...Array(8)].map((_, i) => (
          <Grid item key={i} xs={6} sm={4} lg={3}>
            <Skeleton variant="rectangular" height={250} />
            <Skeleton variant="text" />
            <Skeleton variant="text" width="60%" />
          </Grid>
        ))}
      </Grid>
    </Box>
  </Box>
);

const ProductListPage = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expanded, setExpanded] = useState({});
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('newest');
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);
  const theme = useTheme();
  const [isSidebarExpanded, setIsSidebarExpanded] = useState(true);

  useEffect(() => { /* ... fetching logic is unchanged ... */
    const fetchData = async () => {
      try {
        const [productsRes, categoriesRes] = await Promise.all([
          api.get('/products/products/'),
          api.get('/products/categories/?tree')
        ]);
        setProducts(productsRes.data);
        setCategories(categoriesRes.data.categories || []);
        if (categoriesRes.data.categories) {
          const firstLevelExpanded = {};
          categoriesRes.data.categories.forEach(cat => { firstLevelExpanded[cat.id] = true; });
          setExpanded(firstLevelExpanded);
        }
      } catch (err) {
        setError(err.response?.data?.detail || 'Failed to load data. Please try again later.');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const displayedProducts = useMemo(() => { /* ... filtering logic is unchanged ... */
    let filtered = [...products];
    if (selectedCategory) {
      const getCategoryIds = (cat) => {
        let ids = [cat.id];
        if (cat.children) cat.children.forEach(child => { ids = ids.concat(getCategoryIds(child)); });
        return ids;
      };
      const categoryIds = getCategoryIds(selectedCategory);
      filtered = filtered.filter(p => categoryIds.includes(p.category?.id));
    }
    if (searchTerm) filtered = filtered.filter(p => p.name.toLowerCase().includes(searchTerm.toLowerCase()));
    switch (sortBy) {
      case 'price_asc': return filtered.sort((a, b) => (a.discount_price || a.price) - (b.discount_price || b.price));
      case 'price_desc': return filtered.sort((a, b) => (b.discount_price || b.price) - (a.discount_price || a.price));
      default: return filtered;
    }
  }, [products, selectedCategory, searchTerm, sortBy]);

  const handleCategorySelect = (category) => {
    setSelectedCategory(prev => prev?.id === category?.id ? null : category);
    if (mobileDrawerOpen) setMobileDrawerOpen(false);
  };
  
  const clearFilters = () => {
    setSelectedCategory(null);
    setSearchTerm('');
  };

  const CategoryList = () => {
    const renderCategory = (category, level = 0) => (
      <React.Fragment key={category.id}>
        <ListItemButton selected={selectedCategory?.id === category.id} onClick={() => handleCategorySelect(category)} sx={{ pl: 2 + level * 2, py: 0.5 }}>
          <ListItemText primary={category.name} primaryTypographyProps={{ variant: 'body2', fontWeight: selectedCategory?.id === category.id ? 'bold' : 'normal' }} />
          {category.children?.length > 0 && <IconButton size="small" edge="end" onClick={(e) => { e.stopPropagation(); setExpanded(p => ({...p, [category.id]: !p[category.id]})); }}>{expanded[category.id] ? <ExpandLess /> : <ExpandMore />}</IconButton>}
        </ListItemButton>
        {category.children?.length > 0 && <Collapse in={expanded[category.id]} timeout="auto" unmountOnExit><List component="div" disablePadding dense>{category.children.map(child => renderCategory(child, level + 1))}</List></Collapse>}
      </React.Fragment>
    );
    return (<List dense sx={{ width: '100%' }}><ListItemButton selected={!selectedCategory} onClick={() => handleCategorySelect(null)}><ListItemText primary="All Products" primaryTypographyProps={{ variant: 'body2', fontWeight: 'bold' }} /></ListItemButton><Divider sx={{ my: 1, borderColor: theme.palette.blush }}/>{categories.map(cat => renderCategory(cat))}</List>);
  };
  
  if (loading) return <Container maxWidth={false} sx={{ py: 4, pl: `${SIDEBAR_WIDTH + 32}px !important`, pr: '32px !important' }}><ShopPageSkeleton /></Container>;
  if (error) return <Container maxWidth="lg" sx={{ my: 4 }}><Alert severity="error">{error}</Alert></Container>;

  const drawerContent = (
    <Box sx={{ width: 280, p: 2, display: 'flex', flexDirection: 'column', height: '100%' }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={1} flexShrink={0}>
        <Typography variant="h6">Filters</Typography>
        <IconButton onClick={() => setMobileDrawerOpen(false)}><Close /></IconButton>
      </Box>
      <Box flexGrow={1} sx={{ overflowY: 'auto' }}><CategoryList /></Box>
    </Box>
  );
  
  return (
    <Box sx={{ display: 'flex' }}>
      <Paper 
        elevation={0}
        sx={{
          width: isSidebarExpanded ? SIDEBAR_WIDTH : 0,
          // --- FIX APPLIED HERE ---
          height: `calc(100vh - ${HEADER_HEIGHT}px)`,
          position: 'fixed',
          top: HEADER_HEIGHT, // Start below the header
          left: 0,
          zIndex: 1100,
          overflow: 'hidden',
          transition: theme.transitions.create('width', {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.enteringScreen,
          }),
          display: { xs: 'none', md: 'block' },
          borderRight: `1px solid ${theme.palette.divider}`,
          bgcolor: 'background.default' // Use the default page background
        }}
      >
        <Box sx={{ p: 2, display: 'flex', flexDirection: 'column', height: '100%' }}>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={1} flexShrink={0}>
                <Typography variant="h6" noWrap component="div">Categories</Typography>
                <IconButton onClick={() => setIsSidebarExpanded(false)}><KeyboardArrowLeft /></IconButton>
            </Box>
            <Box flexGrow={1} sx={{ overflowY: 'auto' }}>
                <CategoryList />
            </Box>
        </Box>
      </Paper>
      
      <Fab
        size="small" color="primary" onClick={() => setIsSidebarExpanded(true)}
        sx={{
          position: 'fixed',
          // --- FIX APPLIED HERE ---
          top: HEADER_HEIGHT + 24, // Position relative to the header
          left: '10px',
          zIndex: 1101,
          display: { xs: 'none', md: !isSidebarExpanded ? 'flex' : 'none' },
        }}
      >
        <KeyboardArrowRight />
      </Fab>

      <Box 
        component="main"
        sx={{
          flexGrow: 1,
          transition: theme.transitions.create('margin-left', {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.enteringScreen,
          }),
          ml: { xs: 0, md: isSidebarExpanded ? `${SIDEBAR_WIDTH}px` : 0 },
          p: 4,
          width: { 
            xs: '100%',
            md: `calc(100% - ${isSidebarExpanded ? SIDEBAR_WIDTH : 0}px)` 
          }
        }}
      >
        <Fab color="primary" onClick={() => setMobileDrawerOpen(true)} sx={{ display: { xs: 'flex', md: 'none' }, position: 'fixed', bottom: 24, right: 24 }}><FilterIcon /></Fab>
        
        <Typography variant="h4" component="h1" gutterBottom sx={{ textTransform: 'capitalize' }}>
            {selectedCategory ? selectedCategory.name : 'All Products'}
        </Typography>

        <Box display="flex" justifyContent="space-between" alignItems="center" flexWrap="wrap" gap={2} mb={3}>
            <Typography variant="body2" color="text.secondary">Showing {displayedProducts.length} results</Typography>
            <FormControl size="small" sx={{ minWidth: 180 }}><Select value={sortBy} onChange={(e) => setSortBy(e.target.value)}><MenuItem value="newest">Newest</MenuItem><MenuItem value="price_asc">Price: Low to High</MenuItem><MenuItem value="price_desc">Price: High to Low</MenuItem></Select></FormControl>
        </Box>

        <Box mb={4}>
            <TextField fullWidth variant="outlined" placeholder="Search within collection..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} InputProps={{ startAdornment: (<InputAdornment position="start"><Search color="action" /></InputAdornment>), endAdornment: searchTerm && (<InputAdornment position="end"><IconButton size="small" onClick={() => setSearchTerm('')}><Clear fontSize="small" /></IconButton></InputAdornment>) }}/>
            {(selectedCategory || searchTerm) && (<Stack direction="row" spacing={1} mt={2} alignItems="center"><Typography variant="body2" color="text.secondary">Active Filters:</Typography>{selectedCategory && <Chip label={selectedCategory.name} onDelete={() => setSelectedCategory(null)} color="primary" size="small" />}{searchTerm && <Chip label={`"${searchTerm}"`} onDelete={() => setSearchTerm('')} color="primary" variant="outlined" size="small" />}<Button size="small" onClick={clearFilters} sx={{ textTransform: 'none' }}>Clear All</Button></Stack>)}
        </Box>
        
        {displayedProducts.length > 0 ? (
          <Grid container spacing={3}>{displayedProducts.map(product => (<Grid item key={product.id} xs={6} sm={4} lg={3}><ProductCard product={product} /></Grid>))}</Grid>
        ) : (
          <Box textAlign="center" py={10}><Search color="disabled" sx={{ fontSize: 60, mb: 2 }} /><Typography variant="h6" color="text.secondary" gutterBottom>No Products Found</Typography><Typography variant="body1" color="text.secondary">Try adjusting your search or category filters.</Typography></Box>
        )}
      </Box>

      <Drawer anchor="left" open={mobileDrawerOpen} onClose={() => setMobileDrawerOpen(false)}>
        {drawerContent}
      </Drawer>
    </Box>
  );
};

export default ProductListPage;