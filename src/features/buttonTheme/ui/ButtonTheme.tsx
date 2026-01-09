import React, { FC } from 'react';
import { IconButton, Paper } from '@mui/material';
import LightModeIcon from '@mui/icons-material/LightMode';
import DarkModeIcon from '@mui/icons-material/DarkMode';
import { ButtonThemeProps } from '../model/types';

export const ButtonTheme: FC<ButtonThemeProps> = ({ onThemeMode, themeMode }) => {
  return (
    <Paper
      elevation={2}
      sx={{
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        borderRadius: 2,
        bgcolor: 'rgba(255,255,255,.7)',
        backdropFilter: 'blur(3px)',
      }}
    >
      <IconButton
        onClick={onThemeMode}
        sx={{
          width: 32,
          height: 32,
          borderRadius: 0,
          color: 'primary.main',
          transition: 'all 0.25s ease',
        }}
      >
        {themeMode == 'dark' ? <DarkModeIcon /> : <LightModeIcon />}
      </IconButton>
    </Paper>
  );
};
