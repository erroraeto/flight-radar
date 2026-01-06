import React from 'react';
import { Box, Link } from '@mui/material';

export const MapAttribution = () => {
  return (
    <Box
      sx={{
        position: 'absolute',
        bottom: 0,
        right: 0,
        px: 0.5,
        py: 0.5,
        bgcolor: 'rgba(255,255,255,.35)',
        borderTopLeftRadius: 6,
        fontSize: 10,
        display: 'flex',
        alignItems: 'baseline',
        flexWrap: 'wrap',
        gap: 0.5,
        boxShadow: 2,
        zIndex: 1000,
        backdropFilter: 'blur(2px)',
      }}
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
