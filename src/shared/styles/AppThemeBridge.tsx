import { GlobalStyles, useTheme } from '@mui/material';
import React from 'react';

export const AppThemeBridge = () => {
  const theme = useTheme();

  return (
    <GlobalStyles
      styles={{
        ':root': {
          // '--popup-bg': theme.palette.background.paper,
          // '--popup-text': theme.palette.text.primary,
          '--popup-from-color': theme.palette.popup.fromColor,
          // '--popup-link': theme.palette.primary.main,
        },
      }}
    />
  );
};
