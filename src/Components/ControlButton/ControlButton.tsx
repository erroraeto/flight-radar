import React from 'react';
import { Box } from '@mui/material';

export const ControlButton = ({ style, children, onClick }: any) => (
  <Box
    onClick={onClick}
    sx={{
      width: '100%',
      height: 32,
      aspectRatio: 1,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      cursor: 'pointer',
      // bgcolor: 'background.paper',
      // transition: 'background-color 0.2s ease',
      // '&:hover': {
      //   bgcolor: 'action.hover',
      // },
      // '&:active': {
      //   bgcolor: 'action.selected',
      // },
      style,
    }}
  >
    {children}
  </Box>
);
