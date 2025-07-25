import React, { useState } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { 
  AppBar, Toolbar, Typography, Button, IconButton, Badge, Box, Stack,
  Drawer, List, ListItem, ListItemButton, ListItemText, Divider, Container, useTheme
} from '@mui/material';
// Import necessary icons
import ShoppingCartOutlinedIcon from '@mui/icons-material/ShoppingCartOutlined';
import PersonOutlineOutlinedIcon from '@mui/icons-material/PersonOutlineOutlined';
import MenuIcon from '@mui/icons-material/Menu';
import CloseIcon from '@mui/icons-material/Close';

import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';

const Header = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const { itemCount } = useCart();
  const theme = useTheme();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleDrawerToggle = () => setMobileOpen(!mobileOpen);

  const navLinks = [
    { title: 'Shop', path: '/products' },
    { title: 'Our Story', path: '/our-story' },
    { title: 'Journal', path: '/journal' },
  ];

  const drawerContent = (
    <Box sx={{ width: 280, p: 2 }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography variant="h6" sx={{ fontFamily: "'Laginchy', serif", fontWeight: 400, letterSpacing: '1px' }}>
          NuaréSkyn
        </Typography>
        <IconButton onClick={handleDrawerToggle}><CloseIcon /></IconButton>
      </Box>
      <Divider sx={{ borderColor: theme.palette.nomad }} />
      <List>
        {navLinks.map((link) => (
          <ListItem key={link.title} disablePadding>
            <ListItemButton component={NavLink} to={link.path} onClick={handleDrawerToggle}>
              <ListItemText primary={link.title} />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
      <Divider sx={{ borderColor: theme.palette.nomad }} />
      <List>
        {isAuthenticated ? (
           <>
            <ListItem disablePadding><ListItemButton component={Link} to="/profile" onClick={handleDrawerToggle}><ListItemText primary="My Profile" /></ListItemButton></ListItem>
            {user?.is_staff && <ListItem disablePadding><ListItemButton component={Link} to="/admin/dashboard" onClick={handleDrawerToggle}><ListItemText primary="Admin Panel" /></ListItemButton></ListItem>}
            <ListItem disablePadding><ListItemButton onClick={() => { logout(); handleDrawerToggle(); }}><ListItemText primary="Logout" /></ListItemButton></ListItem>
           </>
        ) : (
          <>
            <ListItem disablePadding><ListItemButton component={Link} to="/login" onClick={handleDrawerToggle}><ListItemText primary="Login" /></ListItemButton></ListItem>
            <ListItem disablePadding><ListItemButton component={Link} to="/register" onClick={handleDrawerToggle}><ListItemText primary="Create Account" /></ListItemButton></ListItem>
          </>
        )}
      </List>
    </Box>
  );

  return (
    <AppBar 
      position="sticky" 
      elevation={0}
      sx={{ 
        // --- THE COLOR CHANGE ---
        bgcolor: 'primary.main', // Use Sandstone
        color: 'background.paper', // Default text/icon color is now White
        borderBottom: `1px solid ${theme.palette.nomad}`, // Use Nomad for the border
        height: 64
      }}
    >
      <Container maxWidth="xl">
        <Toolbar disableGutters sx={{ justifyContent: 'space-between', height: '100%' }}>
          
          <Typography 
            variant="h5" 
            noWrap 
            component={Link} to="/" 
            sx={{ fontFamily: "'Laginchy', serif", fontWeight: 400, letterSpacing: '1px', textDecoration: 'none', color: 'inherit' }}
          >
            NuaréSkyn
          </Typography>
          
          <Box sx={{ display: { xs: 'none', md: 'flex' }, gap: 4 }}>
            {navLinks.map((link) => (
              <Button 
                key={link.title} 
                component={NavLink} to={link.path}
                sx={{ 
                  color: 'background.paper', // White text
                  p: 1, 
                  '&.active': { color: 'background.paper', fontWeight: 'bold', borderBottom: `2px solid ${theme.palette.background.paper}`},
                  '&:hover': { bgcolor: 'transparent', color: 'background.paper', opacity: 0.8 }
                }}
              >
                {link.title}
              </Button>
            ))}
          </Box>
          
          <Stack direction="row" alignItems="center" spacing={1}>
            <Box sx={{ display: { xs: 'none', md: 'flex' }, alignItems: 'center' }}>
              {isAuthenticated ? (
                <>
                  {user?.is_staff && (<Button component={Link} to="/admin/dashboard" sx={{ color: theme.palette.nomad, '&:hover': { color: 'background.paper' } }}>Admin</Button>)}
                  <IconButton color="inherit" component={Link} to="/profile"><PersonOutlineOutlinedIcon /></IconButton>
                  <Button onClick={logout} sx={{ color: theme.palette.nomad, '&:hover': { color: 'background.paper' } }}>Logout</Button>
                </>
              ) : (
                <Button component={Link} to="/login" sx={{ color: 'inherit' }}>Login</Button>
              )}
            </Box>

            <IconButton color="inherit" component={Link} to="/cart">
              <Badge badgeContent={itemCount} color="secondary">
                <ShoppingCartOutlinedIcon />
              </Badge>
            </IconButton>
            
            <IconButton color="inherit" onClick={handleDrawerToggle} sx={{ display: { xs: 'inline-flex', md: 'none' } }}>
              <MenuIcon />
            </IconButton>
          </Stack>
        </Toolbar>
      </Container>
      
      <Drawer anchor="right" open={mobileOpen} onClose={handleDrawerToggle} ModalProps={{ keepMounted: true }} sx={{ '& .MuiDrawer-paper': { width: 280 } }}>
        {drawerContent}
      </Drawer>
    </AppBar>
  );
};

export default Header;