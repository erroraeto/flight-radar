import React from 'react';
import '@shared/styles/App.sass';
import { Stars } from '@features/backgroundStars';
import { MapAttribution } from '@features/mapAttribution';
import { ButtonLocation } from '@features/buttonLocation';
import { ButtonZoom } from '@features/buttonZoom';
import { zoomIn, zoomOut, changeTheme, changeProjection, MapView } from '@features/mapView';
import { Box, CssBaseline, ThemeProvider } from '@mui/material';
import { ButtonTheme } from '@features/buttonTheme';
import { ButtonProjection } from '@features/buttonProjection';
import { LangChanger } from '@features/langChanger';
import { useAppDispatch, useAppSelector } from '@app/hooks';
import { getAppTheme } from '@shared/styles/theme';
import { AppThemeBridge } from '@shared/styles/AppThemeBridge';

export const App = () => {
  const dispatch = useAppDispatch();
  const { theme, mapMode } = useAppSelector((state) => state.map);

  return (
    <ThemeProvider theme={getAppTheme(theme)}>
      <CssBaseline />
      <AppThemeBridge />
      <Box sx={{ position: 'relative', width: '100%', height: '100dvh', bgcolor: 'black' }}>
        <Stars />
        <MapView />
        <MapAttribution />
        <Box
          sx={{
            position: 'absolute',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'end',
            bottom: 16,
            left: 16,
            gap: 1,
            zIndex: 150,
          }}
        >
          <ButtonLocation />
          <ButtonZoom onZoomIn={() => dispatch(zoomIn())} onZoomOut={() => dispatch(zoomOut())} />
          <ButtonTheme onThemeMode={() => dispatch(changeTheme())} themeMode={theme} />
          <ButtonProjection onMapMode={() => dispatch(changeProjection())} mapMode={mapMode} />
        </Box>
        <Box
          sx={{
            position: 'absolute',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'end',
            top: 16,
            right: 16,
            gap: 1,
            bgcolor: 'none',
            zIndex: 150,
          }}
        >
          <LangChanger />
        </Box>
      </Box>
    </ThemeProvider>
  );
};
