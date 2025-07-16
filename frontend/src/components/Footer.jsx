import React from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { 
  Box, Typography, Container, Grid, Stack, TextField, Button, 
  Link, IconButton, Divider, useTheme 
} from '@mui/material';
import { alpha } from '@mui/material/styles';
import FacebookIcon from '@mui/icons-material/Facebook';
import InstagramIcon from '@mui/icons-material/Instagram';
import TwitterIcon from '@mui/icons-material/Twitter';

const Footer = () => {
  const theme = useTheme();

  const FooterLink = ({ to, children }) => (
    <Link 
      component={RouterLink} 
      to={to}
      variant="body2"
      sx={{ 
        color: theme.palette.nomad, // Use Nomad for secondary links
        textDecoration: 'none',
        transition: 'color 0.2s ease-in-out',
        '&:hover': {
          color: theme.palette.background.paper, // Hover to White
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
        bgcolor: 'primary.main', // Use Sandstone
        color: 'background.paper', // Default text/icon color is White
        py: { xs: 5, md: 8 },
        position: 'relative',
        zIndex: 1200, // Higher than sidebar zIndex 1100 to appear on top
      }}
    >
      <Container maxWidth="lg">
        <Grid container spacing={{ xs: 4, md: 5 }}>
          
          <Grid item xs={12} md={4}>
            <Typography 
              variant="h5" 
              sx={{ fontFamily: "'Laginchy', serif", fontWeight: 400, letterSpacing: '1px', color: 'inherit' }}
            >
              NuaréSkyn
            </Typography>
            <Typography variant="body2" sx={{ color: theme.palette.nomad, mt: 1.5, maxWidth: '300px' }}>
              Tailored for you. Inspired by beauty.
            </Typography>
            <Stack direction="row" spacing={1} mt={2}>
              <IconButton aria-label="facebook" sx={{ color: theme.palette.nomad, '&:hover': { color: 'background.paper' } }}><FacebookIcon /></IconButton>
              <IconButton aria-label="instagram" sx={{ color: theme.palette.nomad, '&:hover': { color: 'background.paper' } }}><InstagramIcon /></IconButton>
              <IconButton aria-label="twitter" sx={{ color: theme.palette.nomad, '&:hover': { color: 'background.paper' } }}><TwitterIcon /></IconButton>
            </Stack>
          </Grid>

          <Grid item xs={6} md={2}>
            <Typography variant="subtitle1" fontWeight="bold" gutterBottom>Shop</Typography>
            <Stack spacing={1.5}>
              <FooterLink to="/products">All Products</FooterLink>
              <FooterLink to="/collections/best-sellers">Best Sellers</FooterLink>
              <FooterLink to="/collections/new-arrivals">New Arrivals</FooterLink>
            </Stack>
          </Grid>

          <Grid item xs={6} md={2}>
            <Typography variant="subtitle1" fontWeight="bold" gutterBottom>Support</Typography>
            <Stack spacing={1.5}>
              <FooterLink to="/contact">Contact Us</FooterLink>
              <FooterLink to="/faq">FAQ</FooterLink>
              <FooterLink to="/shipping-returns">Shipping & Returns</FooterLink>
            </Stack>
          </Grid>
          
          <Grid item xs={12} md={4}>
            <Typography variant="subtitle1" fontWeight="bold" gutterBottom>Join The Club</Typography>
            <Typography variant="body2" sx={{ color: theme.palette.nomad, mb: 2 }}>
              Get 10% off your first order and exclusive access to new products.
            </Typography>
            <Stack direction="row" spacing={-0.5}>
              <TextField 
                variant="outlined" size="small" placeholder="Your email address"
                sx={{ 
                  flexGrow: 1, bgcolor: alpha(theme.palette.common.black, 0.1),
                  '& .MuiOutlinedInput-root': {
                    '& fieldset': { borderColor: theme.palette.nomad },
                    '&:hover fieldset': { borderColor: theme.palette.background.paper },
                    borderTopRightRadius: 0, borderBottomRightRadius: 0,
                  },
                  '& .MuiInputBase-input': { color: 'inherit' }
                }}
              />
              <Button 
                variant="contained" 
                color="secondary" // Use Tutara (soft black) for the button
                disableElevation
                sx={{ borderTopLeftRadius: 0, borderBottomLeftRadius: 0, px: 3, '&:hover': { bgcolor: alpha(theme.palette.secondary.main, 0.8) } }}
              >
                Subscribe
              </Button>
            </Stack>
          </Grid>

        </Grid>
        
        <Divider sx={{ my: 4, borderColor: alpha(theme.palette.common.white, 0.15) }} />
        <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, justifyContent: 'space-between', alignItems: 'center', gap: 2 }}>
          <Typography variant="body2" sx={{ color: theme.palette.nomad }}>
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
