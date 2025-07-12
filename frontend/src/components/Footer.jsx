import React from 'react';
import { Box, Typography, Container } from '@mui/material';

const Footer = () => {
  return (
    <Box component="footer" sx={{ py: 3, mt: 'auto', backgroundColor: 'primary.main', color: 'white' }}>
      <Container maxWidth="lg">
        <Typography variant="body1" align="center">
          © {new Date().getFullYear()} Prince Shipping - All rights reserved
        </Typography>
        <Typography variant="body2" align="center" sx={{ mt: 1 }}>
          The ultimate fashion destination
        </Typography>
      </Container>
    </Box>
  );
};

export default Footer;