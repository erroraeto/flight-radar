import React from 'react';
import './MapFrame.sass';
import {
  Map,
  NavigationControl,
  FullscreenControl,
  ScaleControl,
  Marker,
  Popup,
  GeolocateControl,
} from 'react-map-gl/maplibre';
import { MapGLStyleSwitcher, type StyleItem } from 'map-gl-style-switcher/react-map-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import Plane from '../MapFrame/Plane';
import 'map-gl-style-switcher/dist/map-gl-style-switcher.css';
import { fetchPlanes } from './FetchPlanes';
import { getCountryByICAO } from './getByICAO';
type Language = 'en' | 'ru' | 'kk' | 'ja';
import { themeLight, themeDark } from '../../Images';

export const MapFrame = () => {
  const lang = React.useRef<Language>('ru');
  const mapStyles: StyleItem[] = [
    {
      id: 'light',
      name: 'Light',
      image: themeLight,
      styleUrl: `https://basemaps.cartocdn.com/gl/positron-gl-style/style.json`,
      description: 'Light',
    },
    {
      id: 'dark',
      name: 'Dark',
      image: themeDark,
      styleUrl: `https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json`,
      description: 'Dark',
    },
  ];
  const [mapStyle, setMapStyle] = React.useState(mapStyles[0].styleUrl);
  const [activeStyleId, setActiveStyleId] = React.useState(mapStyles[0].id);
  const [isDarkMode, setIsDarkMode] = React.useState(() => {
    return activeStyleId == 'dark';
  });
  React.useEffect(() => {
    setIsDarkMode(activeStyleId == 'dark');
  }, [activeStyleId]);
  const handleStyleChange = (styleUrl: string) => {
    setMapStyle(styleUrl);
    const style = mapStyles.find((s) => s.styleUrl === styleUrl);
    if (style) {
      setActiveStyleId(style.id);
      console.log(`Style changed to: ${style.name}`);
    }
  };
  const [viewState, setViewState] = React.useState({
    longitude: 37.6176,
    latitude: 55.7558,
    zoom: 5,
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

  return (
    <Map
      key={mapStyle}
      {...viewState}
      onMove={(evt) => setViewState(evt.viewState)}
      maxZoom={18}
      style={{
        width: '100%',
        height: '100vh',
        backgroundColor: isDarkMode ? '#404040' : '#f5f5f5',
      }}
      mapStyle={mapStyle}
    >
      <NavigationControl
        position="top-left"
        style={{
          filter: isDarkMode ? 'invert(1) contrast(0.5)' : 'invert(0)',
          // backgroundColor: isDarkMode ? '#404040' : '#f5f5f5',
        }}
      />
      <GeolocateControl
        position="top-left"
        style={{
          filter: isDarkMode ? 'invert(1) contrast(0.5)' : 'invert(0)',
          // backgroundColor: isDarkMode ? '#404040' : '#f5f5f5',
        }}
        trackUserLocation={true}
        onGeolocate={(e) => {
          const { latitude, longitude } = e.coords;
          setGeolocate([latitude, longitude]);

          setViewState((vs) => ({
            ...vs,
            latitude,
            longitude,
          }));
        }}
      />
      <FullscreenControl
        position="top-left"
        style={{
          filter: isDarkMode ? 'invert(1) contrast(0.5)' : 'invert(0)',
          // backgroundColor: isDarkMode ? '#404040' : '#f5f5f5',
        }}
      />
      <ScaleControl />

      <MapGLStyleSwitcher
        styles={mapStyles}
        activeStyleId={activeStyleId}
        theme={isDarkMode ? 'dark' : 'light'}
        showLabels={true}
        showImages={true}
        position="bottom-left"
        onBeforeStyleChange={(from, to) => {
          console.log(`Switching from ${from.name} to ${to.name}`);
        }}
        onStyleChange={handleStyleChange}
      />
      {markers}

      {activePlane && (
        <Popup
          anchor="top"
          longitude={Number(activePlane.lon)}
          latitude={Number(activePlane.lat)}
          onClose={() => setPlaneHex(null)}
        >
          <div className="map-frame__popup-text">
            <strong>{getCountryByICAO(activePlane.reg, lang.current) ?? 'Unknow'}</strong>
            <br />
            <b>speed:</b>
            {Math.round(activePlane.speed)} км/ч
            <br />
            <b>altitude:</b>
            {Math.round(activePlane.alt * 0.3048)} м<br />
          </div>
        </Popup>
      )}
    </Map>
  );
};
