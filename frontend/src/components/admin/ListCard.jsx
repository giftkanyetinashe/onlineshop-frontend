
import React from 'react';
import { Paper, Box, Typography, Stack, Button, List, ListItem, ListItemText, Divider } from '@mui/material';

const ListCard = ({ title, children, action, icon, height = 'auto' }) => (
  <Paper
    elevation={0}
    sx={{ 
      p: 3, 
      height: height, 
      borderRadius: 3, 
      backgroundColor: 'background.paper',
      display: 'flex',
      flexDirection: 'column'
    }}
  >
    <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2}>
      <Stack direction="row" alignItems="center" spacing={1.5}>
        {icon && (
          <Box sx={{ 
            backgroundColor: 'primary.100', 
            color: 'primary.600',
            width: 36,
            height: 36,
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            {icon}
          </Box>
        )}
        <Typography variant="h6" fontWeight={600} color="text.primary">{title}</Typography>
      </Stack>
      {action}
    </Stack>
    <Box sx={{ flex: 1, overflow: 'hidden' }}>
      <List 
        disablePadding 
        sx={{ 
          '& .MuiListItem-root': { 
            px: 0,
            py: 1.5
          },
          '& .MuiDivider-root': {
            my: 1
          }
        }}
      >
        {children}
      </List>
    </Box>
  </Paper>
);

export default ListCard;
