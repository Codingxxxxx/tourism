import React from 'react';
import { Box, Typography } from '@mui/material';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';

export default function SkeletonVideo() {
  return (
    <Box className="w-full h-full flex flex-col items-center justify-center text-center p-4 bg-gray-100 dark:bg-gray-900">
      <ErrorOutlineIcon className="text-red-500 text-6xl mb-4" />
      <Typography variant="h6" className="text-gray-800 dark:text-gray-100 mb-2">
        Video Not Found
      </Typography>
    </Box>
  );
}
