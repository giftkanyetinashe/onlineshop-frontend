import React from 'react';
import { Box, Typography, Button, useTheme, useMediaQuery } from '@mui/material';
import { motion } from 'framer-motion';

const HeroBanner = ({ title, subtitle, ctaText, ctaLink, image }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  return (
    <Box
      sx={{
        position: 'relative',
        height: '20vh', // updated height
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: 'white',
        textAlign: 'center',
        backgroundColor: theme.palette.primary.dark,
        backgroundImage: image ? `url(${image})` : 'linear-gradient(rgba(0, 0, 0, 0.7), rgba(0, 0, 0, 0.7))',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        overflow: 'hidden',
        mb: 6
      }}
    >
      <Box
        sx={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(255, 255, 255, 0.4)',
          zIndex: 1
        }}
      />

      <Box
        component={motion.div}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        sx={{
          position: 'relative',
          zIndex: 2,
          px: 4,
          maxWidth: '800px'
        }}
      >
        <Typography
          variant={isMobile ? 'h5' : 'h4'} // Smaller text for shorter height
          component="h1"
          gutterBottom
          sx={{
            fontWeight: 700,
            textShadow: '2px 2px 4px rgba(255, 255, 255, 0.5)',
            mb: 1
          }}
        >
          {title}
        </Typography>

        <Typography
          variant={isMobile ? 'body1' : 'h6'} // Adjust subtitle size
          component="p"
          gutterBottom
          sx={{
            mb: 2,
            textShadow: '1px 1px 2px rgba(0,0,0,0.5)'
          }}
        >
          {subtitle}
        </Typography>

        <Button
          component={motion.a}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          href={ctaLink}
          variant="contained"
          color="secondary"
          size="medium"
          sx={{
            px: 4,
            py: 1,
            fontSize: '0.9rem',
            fontWeight: 600
          }}
        >
          {ctaText}
        </Button>
      </Box>
    </Box>
  );
};

export default HeroBanner;
