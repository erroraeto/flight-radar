import React, { FC } from 'react';
import GpsFixed from '@mui/icons-material/GpsFixed';
// import GpsOff from '@mui/icons-material/GpsOff';
import GpsNotFixed from '@mui/icons-material/GpsNotFixed';
import { GeoStatus } from '../utils';

type GeoProps = {
  status: GeoStatus;
};

export const MyLocationButton: FC<GeoProps> = ({ status }) => {
  // React.useEffect(() => {
  //   setGeoStatus(status as GeoStatus);
  // }, [status])

  switch (status) {
    case 'searching':
      return <GpsNotFixed fontSize="small" />;
    case 'fixed':
      return <GpsFixed sx={{
        color: '#036fe2',
      }} fontSize="small" />;
    default:
      return <GpsNotFixed fontSize="small" />;
  }
};