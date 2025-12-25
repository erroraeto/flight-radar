// import { Map, GeolocateControl, NavigationControl, GeoJSONSource, Popup } from 'maplibre-gl';
// import { GeolocateControl, NavigationControl, GeoJSONSource, Popup } from 'maplibre-gl';
// import type {FeatureCollection} from 'geojson';
// import { ICAO_NATIONALITY_MARKS } from '../../utils';
// import i18n from '../../i18n';
// import { useTranslation } from 'react-i18next';
// import theme from '../../Images/theme.svg';
// import StyleFlipperControl from "maplibre-gl-style-flipper";
// import { StyleSwitcherControl, type StyleItem } from 'map-gl-style-switcher';
// import { LayerProps } from 'react-map-gl/mapbox-legacy';
// import rawPlanes from './rawPlanes.json';
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

export const MapFrame = () => {
  const lang = React.useRef<Language>('ru');
  const mapStyles: StyleItem[] = [
    {
      id: 'light',
      name: 'Light',
      image: 'https://raw.githubusercontent.com/muimsd/map-gl-style-switcher/refs/heads/main/public/voyager.png',
      styleUrl: `https://basemaps.cartocdn.com/gl/positron-gl-style/style.json`,
      // styleUrl: `https://api.protomaps.com/styles/v5/light/${lang.current}.json?key=015bfa5ea24fa6b9`,
      description: 'Voyager style from Carto',
    },
    {
      id: 'dark',
      name: 'Dark',
      image: 'https://raw.githubusercontent.com/muimsd/map-gl-style-switcher/refs/heads/main/public/positron.png',
      styleUrl: `https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json`,
      // styleUrl: `https://api.protomaps.com/styles/v5/dark/${lang.current}.json?key=015bfa5ea24fa6b9`,
      description: 'Positron style from Carto',
    },
  ];
  const [mapStyle, setMapStyle] = React.useState(mapStyles[0].styleUrl);
  const [activeStyleId, setActiveStyleId] = React.useState(mapStyles[0].id);
  const [isDarkMode, setIsDarkMode] = React.useState(() => {
    return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
  });
  React.useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleThemeChange = (e: MediaQueryListEvent) => {
      setIsDarkMode(e.matches);
    };

    mediaQuery.addEventListener('change', handleThemeChange);
    return () => mediaQuery.removeEventListener('change', handleThemeChange);
  }, []);
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
      {...viewState}
      onMove={(evt) => setViewState(evt.viewState)}
      maxZoom={18}
      style={{
        width: '100%',
        height: '100vh',
        backgroundColor: isDarkMode ? '#1a1a1a' : '#f5f5f5',
      }}
      mapStyle={mapStyle}
    >
      <NavigationControl position="top-left" />
      <GeolocateControl
        position="top-left"
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
      <FullscreenControl position="top-left" />
      <ScaleControl />

      <MapGLStyleSwitcher
        styles={mapStyles}
        activeStyleId={activeStyleId}
        theme="auto"
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

  // const lang = React.useRef<Language>('ru');
  // const mapStyles = {
  //   light: {
  //     code: 'light',
  //     url: `https://api.protomaps.com/styles/v5/light/${lang.current}.json?key=015bfa5ea24fa6b9`,
  //     image: 'https://carto.com/help/images/building-maps/basemaps/positron_labels.png',
  //   },
  //   dark: {
  //     code: 'dark',
  //     url: `https://api.protomaps.com/styles/v5/dark/${lang.current}.json?key=015bfa5ea24fa6b9`,
  //     image: 'https://carto.com/help/images/building-maps/basemaps/dark_labels.png',
  //   },
  // };

  // const mapContainer = React.useRef<HTMLDivElement>(null);
  // const mapRef = React.useRef<Map>(null);
  // const activePlaneHex = React.useRef<string>(null);
  // const activePlane = React.useRef<string[]>(null);
  // const popupRef = React.useRef<Popup>(null);
  // const popupHTML = (p: any) => `
  //   <div class="map-frame__popup-text">
  //     <strong>${t('region')}: ${getCountryByICAO(p.reg) ?? t('unknown')}</strong><br/>
  //     <b>${t('speed')}:</b> ${p.speed ? Math.round(p.speed) + ' км/ч' : '—'}<br/>
  //     <b>${t('altitude')}:</b> ${p.alt ? Math.round(p.alt * 0.3048) + ' м' : '—'}<br/>
  //   </div>
  // `;
  // const planeSVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="none">
  //   <path fill="#0058ff" stroke-linecap="round" stroke-linejoin="round" stroke="#000000" stroke-width="0.7" d="M21 16.2632V14.3684L13.4211 9.63158V4.42105C13.4211 3.63474 12.7863 3 12 3C11.2137 3 10.5789 3.63474 10.5789 4.42105V9.63158L3 14.3684V16.2632L10.5789 13.8947V19.1053L8.68421 20.5263V21.9474L12 21L15.3158 21.9474V20.5263L13.4211 19.1053V13.8947L21 16.2632Z"/>
  // </svg>`;
  // const { t } = useTranslation();
  //
  // function getCountryByICAO(icao: string) {
  //   const prefix = icao
  //     .slice(0, 2)
  //     .replace(/[^a-zA-Z0-9]/g, '')
  //     .toUpperCase();
  //   const nation = ICAO_NATIONALITY_MARKS.find((obj) => obj.codes.includes(prefix));
  //   const lan: Language = lang.current;
  //   console.log(lan);
  //   if (nation) return nation[lan];
  // }
  //
  // React.useEffect(() => {
  //   if (!mapContainer.current) return;
  //
  //   const currentStyle = mapStyles[0];
  //   const map = (mapRef.current = new Map({
  //     container: mapContainer.current,
  //     // style: mapStyles["light"].url,
  //     style: currentStyle.styleUrl,
  //     center: [37.6176, 55.7558],
  //     zoom: 5,
  //     maxZoom: 18,
  //   }));
  //
  //   map.addControl(new NavigationControl());
  //   map.addControl(new GeolocateControl({ trackUserLocation: true }));
  //
  //   // const styleFlipperControl = new StyleFlipperControl(mapStyles);
  //   // styleFlipperControl.setCurrentStyleCode("light");
  //   // map.addControl(styleFlipperControl, "bottom-left");
  //
  //   map.on('load', () => {
  //     initPlanesLayer(map);
  //
  //     // Plane Info Popup
  //     map.on('click', 'planes-layer', (e: any) => {
  //       const props = e.features[0].properties!;
  //       const coords = e.features[0].geometry.coordinates.slice();
  //       activePlaneHex.current = props.hex;
  //
  //       popupRef.current = new Popup({
  //         className: 'map-frame__popup',
  //         closeButton: false,
  //         offset: 10,
  //         subpixelPositioning: true,
  //       })
  //         .setLngLat(coords)
  //         .setHTML(popupHTML(props))
  //         .addTo(map);
  //     });
  //     map.on('mouseenter', 'planes-layer', () => {
  //       map.getCanvas().style.cursor = 'pointer';
  //     });
  //     map.on('mouseleave', 'planes-layer', () => {
  //       map.getCanvas().style.cursor = '';
  //     });
  //
  //     initUserLocation();
  //     setMapLanguage(mapRef.current!, lang.current);
  //   });
  //   map.on('styledata', () => initPlanesLayer(map));
  //
  //   const styleSwitcher = new StyleSwitcherControl({
  //     styles: mapStyles,
  //     theme: 'auto',
  //     dark: mapStyles[1],
  //     showLabels: true,
  //     showImages: true,
  //     activeStyleId: currentStyle.id,
  //     // onBeforeStyleChange: (from, to) => {
  //     //   console.log('Changing style from', from.name, 'to', to.name);
  //     // },
  //     onAfterStyleChange: (_from, to) => {
  //       map.setStyle(to.styleUrl);
  //       // console.log('Style changed to', to.name);
  //     },
  //   });
  //   map.addControl(styleSwitcher, 'bottom-left');
  //
  // }, []);
  //
  // const initPlanesLayer = (map: Map) => {
  //   if (map.getSource('planes')) return;
  //   map.addSource('planes', {
  //     type: 'geojson',
  //     data: { type: 'FeatureCollection', features: [] },
  //   });
  //   map.addLayer({
  //     id: 'planes-layer',
  //     type: 'symbol',
  //     source: 'planes',
  //     layout: {
  //       'icon-image': 'airplane',
  //       'icon-overlap': 'always',
  //       'icon-rotate': ['get', 'direction'],
  //       'icon-rotation-alignment': 'map',
  //     },
  //   });
  //
  //   if (map.hasImage('airplane')) return;
  //   const svgAirplane = new Image(38, 38);
  //   svgAirplane.onload = () => {
  //     map.addImage('airplane', svgAirplane);
  //   };
  //   svgAirplane.src = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(planeSVG);
  //
  // };
  //
  // const initUserLocation = () => {
  //   navigator.geolocation.getCurrentPosition((pos) => {
  //     const lat = pos.coords.latitude;
  //     const lon = pos.coords.longitude;
  //     // let lat = pos.coords.longitude;
  //     // lat = 43.5;
  //     // const lon = 39.7;
  //
  //     mapRef.current?.setCenter([lon, lat]);
  //     mapRef.current?.setZoom(6);
  //
  //     updatePlanes(lat, lon);
  //     setInterval(() => updatePlanes(lat, lon), 1500);
  //   });
  // };
  //
  // const fetchPlanes = async (lat: number, lon: number) => {
  //   try {
  //     const radius = 350;
  //     const response = await fetch(`https://api.airplanes.live/v2/point/${lat}/${lon}/${radius}`);
  //     const data = await response.json();
  //     return data.ac.map((plane: any) => ({
  //       lat: plane.lat,
  //       lon: plane.lon,
  //       hex: plane.hex,
  //       reg: plane.r,
  //       type: plane.t,
  //       speed: plane.gs,
  //       alt: plane.alt_baro,
  //       direction: plane.track ?? plane.dir ?? 0,
  //     }));
  //   } catch (error) {
  //     console.error('Plane API error:', error);
  //     return [];
  //   }
  // };
  //
  // const updatePlanes = async (lat: number, lon: number) => {
  //   const rawPlanes = await fetchPlanes(lat, lon);
  //   if (!mapRef.current) return;
  //
  //   const geojson: any = {
  //     type: 'FeatureCollection',
  //     features: rawPlanes
  //       .filter((p: any) => p.lat && p.lon)
  //       .map((p: any) => ({
  //         type: 'Feature',
  //         geometry: { type: 'Point', coordinates: [p.lon, p.lat] },
  //         properties: {
  //           hex: p.hex ?? null,
  //           reg: p.reg ?? null,
  //           type: p.type ?? null,
  //           speed: p.speed ?? null,
  //           alt: p.alt ?? null,
  //           direction: p.direction,
  //         },
  //       })),
  //   };
  //
  //   const source = mapRef.current.getSource('planes') as GeoJSONSource;
  //   source.setData(geojson);
  //
  //   if (activePlaneHex.current && popupRef.current) {
  //     const updated = rawPlanes.find((p: any) => p.hex === activePlaneHex.current);
  //
  //     if (!updated) {
  //       popupRef.current.remove();
  //       activePlaneHex.current = null;
  //       activePlane.current = null;
  //       return;
  //     }
  //
  //     popupRef.current.setLngLat([updated.lon, updated.lat]).setHTML(popupHTML(updated));
  //     activePlane.current = updated;
  //   }
  // };
  //
  // const setMapLanguage = async (map: Map, language: Language) => {
  //   if (!map) return;
  //   lang.current = language;
  //   await i18n.changeLanguage(language);
  //   console.log(i18n.language);
  //
  //   const fields: string[] = [
  //     `name:${language}`,
  //     'name',
  //     'name_int',
  //     'name_local',
  //     'short_name',
  //     'abbr',
  //     'ref',
  //     'network',
  //     'operator',
  //   ];
  //   const coalesce: (string | string[])[] = ['coalesce', ...fields.map((f) => ['get', f])];
  //
  //   map.getStyle().layers.forEach((layer) => {
  //     if (
  //       layer.type === 'symbol' &&
  //       layer.layout &&
  //       (layer.layout['text-field'] || layer.layout['text-field'] === '')
  //     ) {
  //       map.setLayoutProperty(layer.id, 'text-field', coalesce);
  //     }
  //   });
  // };

  // return (
  //   <div className="map-frame" ref={mapContainer} style={{ width: '100%', height: '100vh' }}>
  //     <div className="language-switcher">
  //       <select
  //         className="language-switcher__select"
  //         name="lang"
  //         onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
  //           setMapLanguage(mapRef.current!, e.target.value as Language)
  //         }
  //       >
  //         <option value="" selected>
  //           -- Выберите язык --
  //         </option>
  //         <option value="ru">Русский</option>
  //         <option value="en">English</option>
  //         <option value="kk">Қазақша</option>
  //         <option value="ja">日本語</option>
  //       </select>
  //     </div>
  //     <button className="theme-changer">
  //       <img alt="theme" src={theme}/>
  //     </button>
  //   </div>
  // );
};
