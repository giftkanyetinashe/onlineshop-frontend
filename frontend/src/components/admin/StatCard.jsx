import React from 'react';
import { Paper, Avatar, Box, Typography, Stack, Chip } from '@mui/material';

const StatCard = ({ title, value, icon, color, subtext, trend, trendValue }) => {
  const isPositive = trendValue >= 0;
  
  return (
    <Paper
      elevation={0}
      sx={{
        p: 3,
        display: 'flex',
        alignItems: 'center',
        borderRadius: 3,
        height: '100%',
        backgroundColor: 'background.paper',
        transition: 'transform 0.2s',
        '&:hover': { transform: 'translateY(-4px)' },
      }}
    >
      <Avatar 
        sx={{ 
          bgcolor: color, 
          color: 'background.paper', 
          width: 56, 
          height: 56, 
          mr: 3 
        }}
      >
        {icon}
      </Avatar>
      <Box>
        <Typography variant="body2" color="text.secondary" fontWeight={500}>
          {title}
        </Typography>
        <Typography variant="h5" component="p" fontWeight="bold" sx={{ mt: 0.5 }}>
          {value}
        </Typography>
        <Stack direction="row" alignItems="center" spacing={1} sx={{ mt: 1 }}>
          {subtext && (
            <Typography variant="caption" color="text.secondary">
              {subtext}
            </Typography>
          )}
          {trendValue !== undefined && (
            <Chip 
              icon={isPositive ? <TrendingUp fontSize="small" /> : <TrendingDown fontSize="small" />}
              label={`${isPositive ? '+' : ''}${trendValue}%`} 
              size="small" 
              sx={{ 
                backgroundColor: isPositive ? 'success.100' : 'error.100',
                color: isPositive ? 'success.800' : 'error.800',
                fontWeight: 600,
                '.MuiChip-icon': {
                  color: isPositive ? 'success.600' : 'error.600',
                  fontSize: '16px'
                }
              }} 
            />
          )}
        </Stack>
      </Box>
    </Paper>
  );
};

export default StatCard;
