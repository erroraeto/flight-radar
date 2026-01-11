import React, { FC } from 'react';
import { Divider, IconButton, Paper } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';
import { ButtonZoomProps } from '../model/types';

export const ButtonZoom: FC<ButtonZoomProps> = ({ onZoomIn, onZoomOut }) => {
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
        onClick={onZoomIn}
        sx={{
          width: 32,
          height: 32,
          borderRadius: 0,
        }}
      >
        <AddIcon fontSize="small" />
      </IconButton>
      <Divider />
      <IconButton
        onClick={onZoomOut}
        sx={{
          width: 32,
          height: 32,
          borderRadius: 0,
        }}
      >
        <RemoveIcon fontSize="small" />
      </IconButton>
    </Paper>
  );
};
