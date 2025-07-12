import React from 'react';
import { Box, Typography, Button, useTheme } from '@mui/material';
import { motion } from 'framer-motion';

// Commented out because the file may not exist
// import EmptyIllustration from '../assets/empty-state.svg';

// Use placeholder image instead
const EmptyIllustration = 'https://via.placeholder.com/300x200?text=No+Data';

const EmptyState = ({ title, description, actionText, onAction }) => {
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
        textAlign: 'center',
        p: 6,
        borderRadius: 2,
        backgroundColor: theme.palette.background.paper,
        boxShadow: theme.shadows[1],
        maxWidth: 600,
        mx: 'auto',
      }}
    >
      <Box
        component="img"
        src={EmptyIllustration}
        alt="Empty state"
        sx={{
          width: '100%',
          maxWidth: 300,
          mb: 4,
          opacity: 0.8,
        }}
      />

      <Typography variant="h5" component="h2" gutterBottom sx={{ fontWeight: 600 }}>
        {title}
      </Typography>

      <Typography variant="body1" color="text.secondary" sx={{ mb: 4, maxWidth: 400 }}>
        {description}
      </Typography>

      {onAction && actionText && (
        <Button
          component={motion.button}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          variant="contained"
          color="primary"
          onClick={onAction}
          sx={{
            px: 4,
            py: 1.5,
            borderRadius: 2,
            fontWeight: 600,
          }}
        >
          {actionText}
        </Button>
      )}
    </Box>
  );
};

export default EmptyState;
