import React, { FC } from 'react';
import { IconButton, Paper } from '@mui/material';
import LightModeIcon from '@mui/icons-material/LightMode';
import DarkModeIcon from '@mui/icons-material/DarkMode';
import { ButtonThemeProps } from '../model/types';

export const ButtonTheme: FC<ButtonThemeProps> = ({ onThemeMode, themeMode }) => {
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
