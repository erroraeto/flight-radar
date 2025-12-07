import React from 'react';
import './MapFrame.sass';
import { Map, GeolocateControl, NavigationControl, GeoJSONSource, Popup } from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import { ICAO_NATIONALITY_MARKS } from '../../utils';
import i18n from '../../i18n';
import { useTranslation } from 'react-i18next';

type Language = 'en' | 'ru' | 'kk' | 'ja';

export const MapFrame = () => {
  const mapContainer = React.useRef<HTMLDivElement>(null);
  const mapRef = React.useRef<Map>(null);
  const activePlaneHex = React.useRef<string>(null);
  const activePlane = React.useRef<string[]>(null);
  const popupRef = React.useRef<Popup>(null);
  const popupHTML = (p: any) => `
    <div class="map-frame__popup-text">
      <strong>${t('region')}: ${getCountryByICAO(p.reg) ?? t('unknown')}</strong><br/>
      <b>${t('speed')}:</b> ${p.speed ? Math.round(p.speed) + ' км/ч' : '—'}<br/>
      <b>${t('altitude')}:</b> ${p.alt ? Math.round(p.alt * 0.3048) + ' м' : '—'}<br/>
    </div>
  `;
  const planeSVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="none">
    <path fill="#0058ff" stroke-linecap="round" stroke-linejoin="round" stroke="#000000" stroke-width="0.7" d="M21 16.2632V14.3684L13.4211 9.63158V4.42105C13.4211 3.63474 12.7863 3 12 3C11.2137 3 10.5789 3.63474 10.5789 4.42105V9.63158L3 14.3684V16.2632L10.5789 13.8947V19.1053L8.68421 20.5263V21.9474L12 21L15.3158 21.9474V20.5263L13.4211 19.1053V13.8947L21 16.2632Z"/>
  </svg>`;
  const lang = React.useRef<Language>('ru');
  const { t } = useTranslation();

  function getCountryByICAO(icao: string) {
    const prefix = icao
      .slice(0, 2)
      .replace(/[^a-zA-Z0-9]/g, '')
      .toUpperCase();
    const nation = ICAO_NATIONALITY_MARKS.find((obj) => obj.codes.includes(prefix));
    const lan: Language = lang.current;
    console.log(lan);
    if (nation) return nation[lan];
  }

  React.useEffect(() => {
    if (!mapContainer.current) return;

    const map = (mapRef.current = new Map({
      container: mapContainer.current,
      style: 'https://americanamap.org/style.json',
      center: [37.6176, 55.7558],
      zoom: 5,
      maxZoom: 18,
      // scrollZoom: true,
      // dragPan: false,
    }));

    // map.dragPan.disable();
    // map.boxZoom.disable();
    // map.dragRotate.disable();
    // // map.keyboard.disable();
    // map.doubleClickZoom.disable();
    // map.touchZoomRotate.enable();

    // map.dragRotate.disable();
    // map.keyboard.disable();
    // map.doubleClickZoom.disable();
    // map.touchZoomRotate.disableRotation();
    // map.dragPan.disable();
    // map.touchZoomRotate.disable();
    // map.scrollZoom.disable();

    map.addControl(new NavigationControl());
    map.addControl(new GeolocateControl({ trackUserLocation: true }));

    map.on('load', () => {
      const svgAirplane = new Image(38, 38);
      svgAirplane.onload = () => {
        map.addImage('airplane', svgAirplane);
      };
      svgAirplane.src = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(planeSVG);

      map.addSource('planes', {
        type: 'geojson',
        data: { type: 'FeatureCollection', features: [] },
      });
      map.addLayer({
        id: 'planes-layer',
        type: 'symbol',
        source: 'planes',
        layout: {
          'icon-image': 'airplane',
          'icon-overlap': 'always',
          'icon-rotate': ['get', 'direction'],
          'icon-rotation-alignment': 'map',
        },
      });

      // Plane Info Popup
      map.on('click', 'planes-layer', (e: any) => {
        const props = e.features[0].properties!;
        const coords = e.features[0].geometry.coordinates.slice();
        activePlaneHex.current = props.hex;

        popupRef.current = new Popup({
          className: 'map-frame__popup',
          closeButton: false,
          offset: 10,
          subpixelPositioning: true,
        })
          .setLngLat(coords)
          .setHTML(popupHTML(props))
          .addTo(map);
      });
      map.on('mouseenter', 'planes-layer', () => {
        map.getCanvas().style.cursor = 'pointer';
      });
      map.on('mouseleave', 'planes-layer', () => {
        map.getCanvas().style.cursor = '';
      });

      initUserLocation();
      setMapLanguage(mapRef.current!, lang.current);
    });
  }, []);

  const initUserLocation = () => {
    navigator.geolocation.getCurrentPosition((pos) => {
      const lat = pos.coords.latitude;
      const lon = pos.coords.longitude;
      // let lat = pos.coords.longitude;
      // lat = 43.5;
      // const lon = 39.7;

      mapRef.current?.setCenter([lon, lat]);
      mapRef.current?.setZoom(6);

      updatePlanes(lat, lon);
      setInterval(() => updatePlanes(lat, lon), 1500);
    });
  };

  const fetchPlanes = async (lat: number, lon: number) => {
    try {
      const radius = 350;
      const response = await fetch(`https://api.airplanes.live/v2/point/${lat}/${lon}/${radius}`);
      const data = await response.json();
      return data.ac.map((plane: any) => ({
        lat: plane.lat,
        lon: plane.lon,
        hex: plane.hex,
        reg: plane.r,
        type: plane.t,
        speed: plane.gs,
        alt: plane.alt_baro,
        direction: plane.track ?? plane.dir ?? 0,
      }));
    } catch (error) {
      console.error('Plane API error:', error);
      return [];
    }
  };

  const updatePlanes = async (lat: number, lon: number) => {
    const rawPlanes = await fetchPlanes(lat, lon);
    if (!mapRef.current) return;

    const geojson: any = {
      type: 'FeatureCollection',
      features: rawPlanes
        .filter((p: any) => p.lat && p.lon)
        .map((p: any) => ({
          type: 'Feature',
          geometry: { type: 'Point', coordinates: [p.lon, p.lat] },
          properties: {
            hex: p.hex ?? null,
            reg: p.reg ?? null,
            type: p.type ?? null,
            speed: p.speed ?? null,
            alt: p.alt ?? null,
            direction: p.direction,
          },
        })),
    };

    const source = mapRef.current.getSource('planes') as GeoJSONSource;
    source.setData(geojson);

    if (activePlaneHex.current && popupRef.current) {
      const updated = rawPlanes.find((p: any) => p.hex === activePlaneHex.current);

      if (!updated) {
        popupRef.current.remove();
        activePlaneHex.current = null;
        activePlane.current = null;
        return;
      }

      popupRef.current.setLngLat([updated.lon, updated.lat]).setHTML(popupHTML(updated));
      activePlane.current = updated;
    }
  };

  const setMapLanguage = async (map: Map, language: Language) => {
    if (!map) return;
    lang.current = language;
    await i18n.changeLanguage(language);
    console.log(i18n.language);

    const fields: string[] = [
      `name:${language}`,
      'name',
      'name_int',
      'name_local',
      'short_name',
      'abbr',
      'ref',
      'network',
      'operator',
    ];
    const coalesce: (string | string[])[] = ['coalesce', ...fields.map((f) => ['get', f])];

    map.getStyle().layers.forEach((layer) => {
      if (
        layer.type === 'symbol' &&
        layer.layout &&
        (layer.layout['text-field'] || layer.layout['text-field'] === '')
      ) {
        map.setLayoutProperty(layer.id, 'text-field', coalesce);
      }
    });
  };

  return (
    <div className="map-frame" ref={mapContainer} style={{ width: '100%', height: '100vh' }}>
      <div className="language-switcher">
        <select
          className="language-switcher__select"
          name="lang"
          onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
            setMapLanguage(mapRef.current!, e.target.value as Language)
          }
        >
          <option value="" selected>
            -- Выберите язык --
          </option>
          <option value="ru">Русский</option>
          <option value="en">English</option>
          <option value="kk">Қазақша</option>
          <option value="ja">日本語</option>
        </select>
      </div>
    </div>
  );
};
