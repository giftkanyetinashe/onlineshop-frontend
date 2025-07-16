import React from 'react';
import { Box } from '@mui/material';
import { motion } from 'framer-motion';

const BrandedLoader = () => {
  return (
    <Box 
      display="flex" 
      justifyContent="center" 
      alignItems="center" 
      minHeight="80vh" // Takes up most of the screen
    >
      <motion.div
        animate={{ 
          scale: [1, 1.1, 1], // Pulse effect
          opacity: [0.8, 1, 0.8] 
        }}
        transition={{ 
          duration: 2, 
          ease: "easeInOut", 
          repeat: Infinity // Loop forever
        }}
        style={{
          fontFamily: "'Laginchy', 'serif'", // Use your elegant heading font
          fontSize: '4rem',
          color: '#7b6c64', // Sandstone color
        }}
      >
        N
      </motion.div>
    </Box>
  );
};

export default BrandedLoader;