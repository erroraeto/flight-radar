import React, { FC } from 'react';
import './PoppupPlaneInfo.sass';
import { Box, Divider, List, ListItem, ListItemIcon, Typography } from '@mui/material';
import { PoppupPlaneInfoProps } from '../model/types';
import { Popup } from 'react-map-gl/maplibre';
import SpeedIcon from '@mui/icons-material/Speed';
import { getCountryByICAO } from '@shared/lib/utils';
import HeightIcon from '@mui/icons-material/Height';
import LanguageIcon from '@mui/icons-material/Language';
import { t } from 'i18next';
import i18n from '@shared/lib/i18n/config';
import { Language } from '@shared/lib/types';

export const PoppupPlaneInfo: FC<PoppupPlaneInfoProps> = ({ activePlane, onClose, theme }) => {
  return (
    <Popup
      latitude={Number(activePlane.lat)}
      longitude={Number(activePlane.lon)}
      anchor="top"
      closeButton={false}
      closeOnClick={true}
      onClose={onClose}
      className={`aircraft-popup ` + theme}
      // data-theme={theme}
    >
      <List
        className="list"
        sx={(theme) => ({
          width: '100%',
          maxWidth: 360,
          p: 0,
          borderRadius: 2,
          border: 'thin solid #b0b0b0',
          background: `linear-gradient(${theme.palette.popup.fromColor} 3%, ${theme.palette.popup.toColor})`,
          boxShadow: 2,
          backdropFilter: 'blur(4px)',
        })}
      >
        <ListItem alignItems="flex-start" sx={{ paddingInline: 2, paddingBlock: 1.5 }}>
          <ListItemIcon sx={{ minWidth: 0, m: 0, marginInlineEnd: 0.6 }}>
            <LanguageIcon />
          </ListItemIcon>
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: 1,
              width: '100%',
            }}
          >
            <Typography variant="body1">{t('region')}:</Typography>
            <Typography variant="body2" color="text.secondary">
              {activePlane && (getCountryByICAO(activePlane.reg, i18n.language as Language) ?? t('unknown'))}
            </Typography>
          </Box>
        </ListItem>
        <Divider component="li" />
        <ListItem alignItems="flex-start" sx={{ paddingInline: 2, paddingBlock: 1.5 }}>
          <ListItemIcon sx={{ minWidth: 0, m: 0, marginInlineEnd: 0.6 }}>
            <SpeedIcon />
          </ListItemIcon>
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: 1,
              width: '100%',
            }}
          >
            <Typography variant="body1">{t('speed')}:</Typography>
            <Typography variant="body2" color="text.secondary">
              {activePlane.speed ? Math.round(activePlane.speed) + ` ${t('speedUnit')}` : '—'}
            </Typography>
          </Box>
        </ListItem>
        <Divider component="li" />
        <ListItem alignItems="flex-start" sx={{ paddingInline: 2, paddingBlock: 1.5 }}>
          <ListItemIcon sx={{ minWidth: 0, m: 0, marginInlineEnd: 0.6 }}>
            <HeightIcon />
          </ListItemIcon>
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: 1,
              width: '100%',
            }}
          >
            <Typography variant="body1">{t('altitude')}:</Typography>
            <Typography variant="body2" color="text.secondary">
              {activePlane.alt ? Math.round(activePlane.alt * 0.3048) + ` ${t('altitudeUnit')}` : '—'}
            </Typography>
          </Box>
        </ListItem>
      </List>
    </Popup>
  );
};
