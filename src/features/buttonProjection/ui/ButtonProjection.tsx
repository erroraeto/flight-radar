import React, { FC } from 'react';
import { IconButton, Paper } from '@mui/material';
import { ButtonProjectionProps } from '../model/types';
import PublicIcon from '@mui/icons-material/Public';
import MapIcon from '@mui/icons-material/Map';

export const ButtonProjection: FC<ButtonProjectionProps> = ({ onMapMode, mapMode }) => {
  return (
    <Paper
      elevation={2}
      sx={(theme) => ({
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        borderRadius: 2,
        boxShadow: `0px 0px 8px ${theme.palette.shadow.default}`,
        backdropFilter: 'blur(3px)',
      })}
    >
      <IconButton
        onClick={onMapMode}
        sx={{
          width: 32,
          height: 32,
          borderRadius: 0,
          color: 'primary.main',
          transition: 'all 0.25s ease',
        }}
      >
        {mapMode == 'globe' ? <PublicIcon /> : <MapIcon />}
      </IconButton>
    </Paper>
  );
};
