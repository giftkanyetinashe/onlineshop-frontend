import React from 'react';
import { Container, Typography, Box } from '@mui/material';

const TestPage = () => {
  return (
    <Container maxWidth="lg">
      <Box my={4}>
        <Typography variant="h4">Test Page</Typography>
        <Typography>This is a minimal test page to verify routing and rendering.</Typography>
      </Box>
    </Container>
  );
};

export default TestPage;
