import React from 'react';
import './MapFrame.sass';
import { Map, Marker, Popup } from 'react-map-gl/maplibre';
import 'maplibre-gl/dist/maplibre-gl.css';
import Plane from '../MapFrame/Plane';
import 'map-gl-style-switcher/dist/map-gl-style-switcher.css';
import { fetchPlanes } from './FetchPlanes';
import { getCountryByICAO } from './getByICAO';
import i18n from '../../i18n';
type Language = 'en' | 'ru' | 'kk' | 'ja';
import { MapRef } from 'react-map-gl/maplibre';
import {
  Box,
  createTheme,
  FormControl,
  IconButton,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  List,
  ListItem,
  Typography,
  ListItemIcon,
  Divider,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';
import LightModeIcon from '@mui/icons-material/LightMode';
import DarkModeIcon from '@mui/icons-material/DarkMode';
import PublicIcon from '@mui/icons-material/Public';
import MapIcon from '@mui/icons-material/Map';
import HeightIcon from '@mui/icons-material/Height';
import SpeedIcon from '@mui/icons-material/Speed';
import LanguageIcon from '@mui/icons-material/Language';
import { DividerH } from '../Divider/Divider';
import { MyLocationButton } from '../MyLocationButton';
import { GeoStatus } from '../../utils';
import { ThemeProvider } from '@mui/material/styles';
import { useTranslation } from 'react-i18next';
import { MapAttribution } from './MapAttribution';
import { Stars } from './Stars';

const INITIAL_VIEW = {
  longitude: 37.6176,
  latitude: 55.7558,
  zoom: 5,
};

export const MapFrame = () => {
  const mapRef = React.useRef<MapRef>(null as unknown as MapRef);
  const mapStyle: string = `https://tiles.openfreemap.org/styles/bright`;
  const [viewState, setViewState] = React.useState(INITIAL_VIEW);
  const zoomIn = () => {
    mapRef?.current.zoomTo(viewState.zoom + 1, { duration: 300 });
  };
  const zoomOut = () => {
    mapRef?.current.zoomTo(viewState.zoom - 1, { duration: 300 });
  };
  const locateUser = () => {
    if (!navigator.geolocation) {
      setGeoStatus('off');
      return alert('Geolocation is not supported');
    }
    setGeoStatus('searching');

    navigator.geolocation.getCurrentPosition(
      // (pos) => {
      () => {
        // const { latitude, longitude } = pos.coords;
        const latitude = 43.57;
        const longitude = 39.74;
        setGeolocate([latitude, longitude]);
        mapRef?.current.flyTo({
          center: [longitude, latitude],
          zoom: 5,
          duration: 1000,
        });
        setGeoStatus('fixed');
      },
      (error) => {
        console.log(error);
        setGeoStatus('off');
      },
      { enableHighAccuracy: true },
    );
  };
  const [geoStatus, setGeoStatus] = React.useState<GeoStatus>('off');
  const [themeMode, setThemeMode] = React.useState<'light' | 'dark'>('light');
  const [mapMode, setMapMode] = React.useState<'globe' | 'mercator'>('globe');
  const [language, setLanguage] = React.useState<Language>('en');
  const languages = [
    { code: 'en', label: 'English' },
    { code: 'ru', label: 'Russian' },
    { code: 'kk', label: 'Kazakhstan' },
    { code: 'ja', label: 'Japan' },
  ];
  const { t } = useTranslation();
  const theme = createTheme({
    palette: {
      primary: {
        main: '#007FFF',
        dark: '#0066CC',
      },
    },
  });
  const [geolocate, setGeolocate] = React.useState<number[] | null>(null);
  const [rawPlanes, setRawPlanes] = React.useState<React.ReactElement[] | null>(null);
  const [markers, setMarkers] = React.useState<React.ReactElement[] | null>(null);
  const [selectPlaneHex, setPlaneHex] = React.useState<string | null>(null);
  const timer = React.useRef<number>(null);
  React.useEffect(() => {
    if (!geolocate) return;

    const loadPlanes = async () => {
      const [lat, lon] = geolocate;
      const rawPlanes = await fetchPlanes(lat, lon);
      setRawPlanes(rawPlanes);
      const plane = rawPlanes.map((p: any, id: number) => (
        <Marker
          key={`marker-${id}`}
          longitude={p.lon}
          latitude={p.lat}
          rotation={p.direction}
          anchor="bottom"
          onClick={(e) => {
            e.originalEvent.stopPropagation();
            setPlaneHex(p.hex);
          }}
        >
          <Plane size={30} />
        </Marker>
      ));
      setMarkers(plane);
    };

    loadPlanes();
    if (timer.current) {
      clearInterval(timer.current);
    }
    timer.current = window.setInterval(loadPlanes, 2000);
  }, [geolocate]);
  const activePlane: any = React.useMemo(() => {
    if (!selectPlaneHex) return null;
    return rawPlanes?.find((p: any) => p.hex === selectPlaneHex) ?? null;
  }, [rawPlanes, selectPlaneHex]);
  const setMapLanguage = (map: any, language: Language) => {
    if (!map?.isStyleLoaded()) return;

    const layers = map.getStyle()?.layers;
    if (!layers) return;

    for (const layer of layers) {
      if (layer.type !== 'symbol') continue;
      const tf = layer.layout['text-field'];
      if (!tf) continue;

      if (typeof tf === 'string' || Array.isArray(tf) || (tf[0] == 'coalesce' && tf[0] == 'case')) {
        map.setLayoutProperty(layer.id, 'text-field', ['coalesce', ['get', `name:${language}`], ['get', 'name']]);
      }
    }
  };

  return (
    <ThemeProvider theme={theme}>
      <Box
        className={themeMode == 'dark' ? 'dark' : 'light'}
        sx={{ position: 'relative', width: '100%', height: '100vh', bgcolor: 'black' }}
      >
        <Stars />
        <Map
          ref={mapRef}
          initialViewState={INITIAL_VIEW}
          attributionControl={false}
          {...viewState}
          onMove={(e) => {
            setViewState(e.viewState);
            if (e.originalEvent && geoStatus != 'searching') {
              setGeoStatus('manual');
            }
          }}
          onClick={() => setPlaneHex(null)}
          maxZoom={18}
          style={{
            width: '100%',
            height: '100vh',
            backgroundColor: 'transparent',
            transition: 'all .3s ease',
          }}
          mapStyle={mapStyle}
          projection={mapMode}
          onLoad={() => {
            const map = mapRef.current?.getMap();
            if (!map) return;
            setMapLanguage(map, language);
          }}
        >
          {markers}
          {activePlane && (
            <Popup
              longitude={Number(activePlane.lon)}
              latitude={Number(activePlane.lat)}
              anchor="top"
              closeButton={false}
              closeOnClick={true}
              onClose={() => setPlaneHex(null)}
              className="aircraft-popup"
            >
              <List
                className="list"
                sx={{
                  width: '100%',
                  maxWidth: 360,
                  p: 0,
                  borderRadius: 2,
                  border: 'thin solid #b0b0b0',
                  background: 'linear-gradient(white 3%, rgba(255,255,255,.3))',
                  boxShadow: 2,
                  backdropFilter: 'blur(4px)',
                }}
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
                      {getCountryByICAO(activePlane.reg, language) ?? t('unknown')}
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
                      {activePlane.speed ? Math.round(activePlane.speed) + ' км/ч' : '—'}
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
                      {activePlane.alt ? Math.round(activePlane.alt * 0.3048) + ' м' : '—'}
                    </Typography>
                  </Box>
                </ListItem>
              </List>
            </Popup>
          )}
        </Map>
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
          <Paper
            elevation={2}
            sx={{
              position: 'relative',
              display: 'flex',
              overflow: 'hidden',
              borderRadius: 2,
              bgcolor: 'rgba(255,255,255,.7)',
              backdropFilter: 'blur(3px)',
            }}
          >
            <IconButton
              onClick={locateUser}
              sx={{
                width: 32,
                height: 32,
                borderRadius: 0,
              }}
            >
              <MyLocationButton status={geoStatus} />
            </IconButton>
          </Paper>
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
              onClick={zoomIn}
              sx={{
                width: 32,
                height: 32,
                borderRadius: 0,
              }}
            >
              <AddIcon fontSize="small" />
            </IconButton>
            <DividerH />
            <IconButton
              onClick={zoomOut}
              sx={{
                width: 32,
                height: 32,
                borderRadius: 0,
              }}
            >
              <RemoveIcon fontSize="small" />
            </IconButton>
          </Paper>
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
              onClick={() => setThemeMode(themeMode == 'dark' ? 'light' : 'dark')}
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
              onClick={() => setMapMode(mapMode == 'globe' ? 'mercator' : 'globe')}
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
            <FormControl sx={{ m: 1 }} size="small">
              <InputLabel id="language-label">{t('language')}</InputLabel>
              <Select
                labelId="language-label"
                label={t('language')}
                value={language}
                onChange={(e) => {
                  const lang = e.target.value;
                  i18n.changeLanguage(lang);
                  setLanguage(lang);
                  const map = mapRef.current?.getMap();
                  if (!map) return;
                  setMapLanguage(map, lang);
                }}
              >
                {languages.map((language) => (
                  <MenuItem key={language.code} value={language.code}>
                    {language.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Paper>
        </Box>
      </Box>
    </ThemeProvider>
  );
};
