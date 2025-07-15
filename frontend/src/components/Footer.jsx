import React from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { 
  Box, Typography, Container, Grid, Stack, TextField, Button, 
  Link, IconButton, Divider, useTheme 
} from '@mui/material';
// Import social media icons
import FacebookIcon from '@mui/icons-material/Facebook';
import InstagramIcon from '@mui/icons-material/Instagram';
import TwitterIcon from '@mui/icons-material/Twitter';

const Footer = () => {
  const theme = useTheme();

  // Helper component for link stacks, styled for a LIGHT background
  const FooterLink = ({ to, children }) => (
    <Link 
      component={RouterLink} 
      to={to}
      variant="body2"
      sx={{ 
        color: 'text.secondary', // Use the theme's secondary text color (softTaupe)
        textDecoration: 'none',
        transition: 'color 0.2s ease-in-out',
        '&:hover': {
          color: 'primary.main', // Hover to the primary brand color
        }
      }}
    >
      {children}
    </Link>
  );

  return (
    <Box 
      component="footer" 
      sx={{
        // --- THE COLOR CHANGE ---
        // Mirroring the header's style
        bgcolor: 'background.paper', // Use white, same as the header
        color: 'text.primary',       // Use dark text, same as the header
        borderTop: `1px solid ${theme.palette.blush}`, // Use the soft blush border
        py: { xs: 5, md: 8 },
      }}
    >
      <Container maxWidth="lg">
        <Grid container spacing={{ xs: 4, md: 5 }}>
          
          <Grid item xs={12} md={4}>
            <Typography 
              variant="h5" 
              sx={{ 
                fontFamily: "'Laginchy', serif", 
                fontWeight: 400, 
                letterSpacing: '1px',
              }}
            >
              NuaréSkyn
            </Typography>
            <Typography variant="body2" sx={{ color: 'text.secondary', mt: 1.5, maxWidth: '300px' }}>
              Tailored for you. Inspired by beauty.
            </Typography>
            <Stack direction="row" spacing={1} mt={2}>
              {/* Icons now inherit the dark text color and hover to primary */}
              <IconButton aria-label="facebook" color="inherit" sx={{ color: 'text.secondary', '&:hover': { color: 'primary.main' } }}><FacebookIcon /></IconButton>
              <IconButton aria-label="instagram" color="inherit" sx={{ color: 'text.secondary', '&:hover': { color: 'primary.main' } }}><InstagramIcon /></IconButton>
              <IconButton aria-label="twitter" color="inherit" sx={{ color: 'text.secondary', '&:hover': { color: 'primary.main' } }}><TwitterIcon /></IconButton>
            </Stack>
          </Grid>

          <Grid item xs={6} md={2}>
            <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
              Shop
            </Typography>
            <Stack spacing={1.5}>
              <FooterLink to="/products">All Products</FooterLink>
              <FooterLink to="/collections/best-sellers">Best Sellers</FooterLink>
              <FooterLink to="/collections/new-arrivals">New Arrivals</FooterLink>
            </Stack>
          </Grid>

          <Grid item xs={6} md={2}>
            <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
              Support
            </Typography>
            <Stack spacing={1.5}>
              <FooterLink to="/contact">Contact Us</FooterLink>
              <FooterLink to="/faq">FAQ</FooterLink>
              <FooterLink to="/shipping-returns">Shipping & Returns</FooterLink>
            </Stack>
          </Grid>
          
          <Grid item xs={12} md={4}>
            <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
              Join The Club
            </Typography>
            <Typography variant="body2" sx={{ color: 'text.secondary', mb: 2 }}>
              Get 10% off your first order and exclusive access to new products.
            </Typography>
            <Stack direction="row" spacing={-0.5}>
              <TextField 
                variant="outlined"
                size="small"
                placeholder="Your email address"
                sx={{ 
                  flexGrow: 1, 
                  // Let the global theme styles handle the TextField look
                  '& .MuiOutlinedInput-root': { 
                    borderTopRightRadius: 0, 
                    borderBottomRightRadius: 0 
                  } 
                }}
              />
              <Button 
                variant="contained" 
                color="primary"
                disableElevation
                sx={{ borderTopLeftRadius: 0, borderBottomLeftRadius: 0, px: 3 }}
              >
                Subscribe
              </Button>
            </Stack>
          </Grid>

        </Grid>
        
        <Divider sx={{ my: 4, borderColor: theme.palette.blush }} />
        <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, justifyContent: 'space-between', alignItems: 'center', gap: 2 }}>
          <Typography variant="body2" color="text.secondary">
            © {new Date().getFullYear()} NuaréSkyn. All rights reserved.
          </Typography>
          <Stack direction="row" spacing={3}>
            <FooterLink to="/terms-of-service">Terms of Service</FooterLink>
            <FooterLink to="/privacy-policy">Privacy Policy</FooterLink>
          </Stack>
        </Box>

      </Container>
    </Box>
  );
};

export default Footer;