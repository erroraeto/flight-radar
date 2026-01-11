import React from 'react';
import { Box, Link } from '@mui/material';

export const MapAttribution = () => {
  return (
    <Box
      sx={(theme) => ({
        position: 'absolute',
        bottom: 0,
        right: 0,
        px: 0.5,
        py: 0.5,
        bgcolor: theme.palette.background.default,
        borderTopLeftRadius: 6,
        // fontSize: 10,
        display: 'flex',
        alignItems: 'baseline',
        flexWrap: 'wrap',
        gap: 0.5,
        boxShadow: `0px 0px 8px ${theme.palette.shadow.default}`,
        zIndex: 1000,
        backdropFilter: 'blur(2px)',
        transition: 'all .3s ease',
        maxWidth: {
          xs: '70vw',
          sm: 'none',
          md: 'none',
        },
        fontSize: {
          xs: '8px',
          sm: '10px',
          md: '10px',
        },
      })}
    >
      <span>©</span>
      <Link href="https://maplibre.org/" target="_blank" rel="noopener noreferrer" underline="hover">
        MapLibre
      </Link>
      <span>|</span>
      <span>©</span>
      <Link href="https://openfreemap.org/" target="_blank" rel="noopener noreferrer" underline="hover">
        OpenFreeMap
      </Link>
      <span>|</span>
      <span>©</span>
      <Link href="https://openmaptiles.org/" target="_blank" rel="noopener noreferrer" underline="hover">
        OpenMapTiles
      </Link>
      <span>data ©</span>
      <Link href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener noreferrer" underline="hover">
        OpenStreetMap
      </Link>
      <span>contributors</span>
    </Box>
  );
};
