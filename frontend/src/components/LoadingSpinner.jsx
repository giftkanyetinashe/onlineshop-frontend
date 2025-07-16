import React from 'react';
import { Box, Typography } from '@mui/material';
import { motion } from 'framer-motion';

const LoadingSpinner = () => {
  return (
    <Box 
      display="flex" 
      justifyContent="center" 
      alignItems="center" 
      minHeight="80vh"
    >
      <motion.div
        animate={{
          opacity: [0.5, 1, 0.5],
        }}
        transition={{
          duration: 1.5,
          ease: "easeInOut",
          repeat: Infinity,
        }}
      >
        <Typography 
          sx={{ 
            fontFamily: "'Laginchy', serif", 
            fontSize: '4rem', 
            color: 'primary.main'
          }}
        >
          N
        </Typography>
      </motion.div>
    </Box>
  );
};

export default LoadingSpinner;