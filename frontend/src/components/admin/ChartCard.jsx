import React from 'react';
import { Paper, Box, Typography, Stack, Button } from '@mui/material';

const ChartCard = ({ title, children, action, height = 320 }) => (
  <Paper
    elevation={0}
    sx={{ 
      p: 3, 
      height: '100%', 
      borderRadius: 3, 
      backgroundColor: 'background.paper',
      display: 'flex',
      flexDirection: 'column'
    }}
  >
    <Stack direction="row" justifyContent="space-between" alignItems="center" mb={3}>
      <Typography variant="h6" fontWeight={600} color="text.primary">{title}</Typography>
      {action}
    </Stack>
    <Box sx={{ flex: 1, minHeight: height }}>
      {children}
    </Box>
  </Paper>
);

export default ChartCard;
