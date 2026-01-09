import React from 'react';
import { IconButton, Paper } from '@mui/material';
import GpsFixed from '@mui/icons-material/GpsFixed';
import GpsNotFixed from '@mui/icons-material/GpsNotFixed';
import { keyframes } from '@mui/system';
import { getLocation } from '../lib/thunks';
import { useAppDispatch, useAppSelector } from '../../../app/hooks';

const rotate = keyframes`
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
`;

export const ButtonLocation = () => {
  const dispatch = useAppDispatch();
  const { geoStatus } = useAppSelector((state) => state.location);
  const switchIcon = (() => {
    switch (geoStatus) {
      case 'searching':
        return <GpsNotFixed sx={{ animation: `${rotate} 2s linear infinite` }} fontSize="small" />;
      case 'fixed':
        return <GpsFixed sx={{ color: '#036fe2' }} fontSize="small" />;
      case 'manual':
        return <GpsNotFixed sx={{ color: '#036fe2' }} fontSize="small" />;
      default:
        return <GpsNotFixed fontSize="small" />;
    }
  })();

  return (
    <Paper
      elevation={2}
      sx={{
        position: 'relative',
        display: 'flex',
        overflow: 'hidden',
        borderRadius: 2,
        bgcolor: 'rgba(255,255,255,.7)',
        backdropFilter: 'blur(3px)',
      }}
    >
      <IconButton
        onClick={() => dispatch(getLocation())}
        sx={{
          width: 32,
          height: 32,
          borderRadius: 0,
        }}
      >
        {switchIcon}
      </IconButton>
    </Paper>
  );
};
