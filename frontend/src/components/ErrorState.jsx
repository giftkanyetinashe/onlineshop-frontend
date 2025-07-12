import React from 'react';
import { Box, Typography, Button, useTheme } from '@mui/material';
import { motion } from 'framer-motion';

// Placeholder image in case the SVG doesn't exist
const ErrorIllustration = 'https://via.placeholder.com/300x200?text=Error';

const ErrorState = ({ message, onRetry }) => {
  const theme = useTheme();

  return (
    <Box
      component={motion.div}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '60vh',
        textAlign: 'center',
        p: 4,
      }}
    >
      <Box
        component="img"
        src={ErrorIllustration}
        alt="Error state"
        sx={{
          width: '100%',
          maxWidth: 300,
          mb: 4,
          opacity: 0.8,
        }}
      />

      <Typography variant="h5" component="h2" gutterBottom sx={{ fontWeight: 600, color: theme.palette.error.main }}>
        Oops! Something went wrong
      </Typography>

      <Typography variant="body1" color="text.secondary" sx={{ mb: 4, maxWidth: 500 }}>
        {message || 'We encountered an error while loading the content. Please try again.'}
      </Typography>

      {onRetry && (
        <Button
          component={motion.button}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          variant="contained"
          color="error"
          onClick={onRetry}
          sx={{
            px: 4,
            py: 1.5,
            borderRadius: 2,
            fontWeight: 600,
          }}
        >
          Try Again
        </Button>
      )}
    </Box>
  );
};

export default ErrorState;
