import React from 'react';
import './MapFrame.sass';
import {
  Map,
  // NavigationControl,
  // FullscreenControl,
  // ScaleControl,
  Marker,
  Popup,
  // GeolocateControl,
} from 'react-map-gl/maplibre';
// import { MapGLStyleSwitcher, type StyleItem } from 'map-gl-style-switcher/react-map-gl';
import { type StyleItem } from 'map-gl-style-switcher/react-map-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import Plane from '../MapFrame/Plane';
import 'map-gl-style-switcher/dist/map-gl-style-switcher.css';
import { fetchPlanes } from './FetchPlanes';
import { getCountryByICAO } from './getByICAO';
import i18n from '../../i18n';
// import { useTranslation } from 'react-i18next';
import { themeLight, themeDark } from '../../Images';
type Language = 'en' | 'ru' | 'kk' | 'ja';
import { MapRef } from 'react-map-gl/maplibre';
// import "maplibre-theme/icons.lucide.css";
// import "maplibre-theme/modern.css";
// import Voyager from "../../public/map/style1.json";
import { Box, createTheme, FormControl, IconButton, InputLabel, MenuItem, Paper, Select } from '@mui/material';
// import GpsNotFixedIcon from "@mui/icons-material/GpsNotFixed";
// import AddOutlinedIcon from "@mui/icons-material/AddOutlined";
// import RemoveOutlinedIcon from "@mui/icons-material/RemoveOutlined";
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';
import LightModeIcon from '@mui/icons-material/LightMode';
import DarkModeIcon from '@mui/icons-material/DarkMode';
import PublicIcon from '@mui/icons-material/Public';
import MapIcon from '@mui/icons-material/Map';
// import MyLocationIcon from "@mui/icons-material/MyLocation";
import { ControlButton } from '../ControlButton/ControlButton';
import { DividerH } from '../Divider/Divider';
import { MyLocationButton } from '../MyLocationButton';
import { GeoStatus } from '../../utils';
import { ThemeProvider } from '@mui/material/styles';
// import { MaterialUISwitch } from '../MaterialSwitch';

const INITIAL_VIEW = {
  longitude: 37.6176,
  latitude: 55.7558,
  zoom: 5,
};

export const MapFrame = () => {
  const mapRef = React.useRef<MapRef>(null as unknown as MapRef);
  // const lang = React.useRef<Language>('ru');
  // const { t } = useTranslation();
  const mapStyles: StyleItem[] = [
    {
      id: 'light',
      name: 'Light',
      image: themeLight,
      styleUrl: `https://tiles.openfreemap.org/styles/bright`,
      // styleUrl: `/map/dark.json`,
      // styleUrl: `https://basemaps.cartocdn.com/gl/voyager-gl-style/style.json`,
      description: 'Light',
    },
    {
      id: 'dark',
      name: 'Dark',
      image: themeDark,
      // styleUrl: `https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json`,
      styleUrl: `https://tiles.openfreemap.org/styles/bright`,
      description: 'Dark',
    },
  ];
  // const [mapStyle, setMapStyle] = React.useState(mapStyles[0].styleUrl);
  // const mapStyle = React.useRef(mapStyles[0].styleUrl);
  // const [activeStyleId, setActiveStyleId] = React.useState(mapStyles[0].id);
  // const activeStyleId = React.useRef(mapStyles[0].id);
  // const [isDarkMode, setIsDarkMode] = React.useState(() => {
  //   return activeStyleId == 'dark';
  // });
  // React.useEffect(() => {
  //   setIsDarkMode(activeStyleId == 'dark');
  // }, [activeStyleId]);
  // const handleStyleChange = (styleUrl: string) => {
  //   setMapStyle(styleUrl);
  //   console.log(styleUrl);
  //   const style = mapStyles.find((s) => s.styleUrl === styleUrl);
  //   if (style) {
  //     setActiveStyleId(style.id);
  //     console.log(`Style changed to: ${style.name}`);
  //   }
  // };
  // const [viewState, setViewState] = React.useState({
  //   longitude: 37.6176,
  //   latitude: 55.7558,
  //   zoom: 5,
  // });
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
      (pos) => {
        const { latitude, longitude } = pos.coords;
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
  const theme = createTheme({
    palette: {
      primary: {
        main: '#007FFF',
        dark: '#0066CC',
      },
    },
  });

  const [geolocate, setGeolocate] = React.useState<number[] | null>(null);
  // const geolocateControlRef = React.useRef<any>(null);

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
      <Box sx={{ position: 'relative', width: '100%', height: '100vh' }}>
        <Map
          ref={mapRef}
          initialViewState={INITIAL_VIEW}
          {...viewState}
          onMove={(e) => setViewState(e.viewState)}
          maxZoom={18}
          style={{
            width: '100%',
            height: '100vh',
            filter: themeMode == 'dark' ? 'invert(1) grayscale(1)' : '',
            backgroundColor: themeMode == 'dark' ? '#b8b8b8' : '#f5f5f5',
            transition: 'all .3s ease',
          }}
          mapStyle={mapStyles[0].styleUrl}
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
              anchor="top"
              longitude={Number(activePlane.lon)}
              latitude={Number(activePlane.lat)}
              onClose={() => setPlaneHex(null)}
            >
              <div className="popup-info">
                <p className="popup-info__row">
                  <span>Region:</span>
                  <span>{getCountryByICAO(activePlane.reg, language) ?? 'Unknown'}</span>
                </p>
                <p className="popup-info__row">
                  <span>Speed:</span>
                  <span>{Math.round(activePlane.speed)} км/ч</span>
                </p>
                <p className="popup-info__row">
                  <span>Altitude:</span>
                  <span>{Math.round(activePlane.alt * 0.3048)} м</span>
                </p>
              </div>
            </Popup>
          )}
        </Map>
        <Box
          sx={{
            position: 'absolute',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'end',
            bottom: 16,
            left: 16,
            gap: 1,
          }}
        >
          <Paper
            elevation={2}
            sx={{
              position: 'relative',
              overflow: 'hidden',
              borderRadius: 2,
            }}
          >
            <ControlButton onClick={locateUser}>
              <MyLocationButton status={geoStatus} />
            </ControlButton>
          </Paper>
          <Paper
            elevation={2}
            sx={{
              position: 'relative',
              display: 'flex',
              flexDirection: 'column',
              overflow: 'hidden',
              borderRadius: 2,
            }}
          >
            <ControlButton onClick={zoomIn}>
              <AddIcon fontSize="small" />
            </ControlButton>
            <DividerH />
            <ControlButton onClick={zoomOut}>
              <RemoveIcon fontSize="small" />
            </ControlButton>
          </Paper>
          <Paper
            elevation={2}
            sx={{
              position: 'relative',
              display: 'flex',
              flexDirection: 'column',
              overflow: 'hidden',
              borderRadius: 2,
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
            }}
          >
            <FormControl sx={{ m: 1 }} size="small">
              <InputLabel id="language-label">Language</InputLabel>
              <Select
                labelId="language-label"
                label="Language"
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
