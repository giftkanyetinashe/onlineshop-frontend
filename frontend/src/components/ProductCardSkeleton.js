import React from 'react';
import { Skeleton, Stack } from '@mui/material';

const ProductCardSkeleton = () => (
  <Stack spacing={1}>
    <Skeleton variant="rectangular" width="100%" sx={{ paddingTop: '125%' }} />
    <Skeleton variant="text" width="80%" />
    <Skeleton variant="text" width="40%" />
  </Stack>
);

export default ProductCardSkeleton;