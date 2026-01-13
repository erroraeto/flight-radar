import { GlobalStyles, useTheme } from '@mui/material';
import React from 'react';

export const AppThemeBridge = () => {
  const theme = useTheme();

  return (
    <GlobalStyles
      styles={{
        ':root': {
          '--popup-from-color': theme.palette.popup.fromColor,
        },
      }}
    />
  );
};
