import React, { FC } from 'react';
import GpsFixed from '@mui/icons-material/GpsFixed';
// import GpsOff from '@mui/icons-material/GpsOff';
import GpsNotFixed from '@mui/icons-material/GpsNotFixed';
import { keyframes } from '@mui/system';
import { GeoStatus } from '../utils';

type GeoProps = {
  status: GeoStatus;
};

const rotate = keyframes`
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
`;

export const MyLocationButton: FC<GeoProps> = ({ status }) => {
  switch (status) {
    case 'searching':
      return <GpsNotFixed sx={{ animation: `${rotate} 2s linear infinite` }} fontSize="small" />;
    case 'fixed':
      return <GpsFixed sx={{ color: '#036fe2' }} fontSize="small" />;
    case 'manual':
      return <GpsNotFixed sx={{ color: '#036fe2' }} fontSize="small" />;
    default:
      return <GpsNotFixed fontSize="small" />;
  }
};
