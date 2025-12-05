import React from 'react';
import './MapFrame.sass';
import { Map, GeolocateControl, NavigationControl, GeoJSONSource, Marker, Popup } from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import { ICAO_NATIONALITY_MARKS } from '../../utils';

export const MapFrame = () => {
  const mapContainer = React.useRef<HTMLDivElement>(null);
  const mapRef = React.useRef<Map>(null);
  const markerRef: React.RefObject<any> = React.useRef(null);
  const userPos = React.useRef<{ lat: number; lon: number }>(null);

  const activePlane = React.useRef<any>(null);
  const popupRef = React.useRef<Popup>(null);
  const popupHTML = (p: any) => `
    <div class="map-frame__popup-text">
      <strong>Регион: ${getCountryByRegistration(p.reg) ?? '—'}</strong><br/>
      <b>Скорость:</b> ${p.speed ? p.speed + ' км/ч' : '—'}<br/>
      <b>Высота:</b> ${p.alt ? p.alt + ' м' : '—'}<br/>
    </div>
  `;

  function getCountryByRegistration(reg: string): string {
    const prefix = reg.slice(0, 2).replace(/[^a-zA-Z0-9]/g, '');
    console.log(prefix);
    const code = prefix.toUpperCase();
    console.log(code);
    return ICAO_NATIONALITY_MARKS[code] ?? 'Неизвестно';
  }

  React.useEffect(() => {
    if (!mapContainer.current) return;

    const map = (mapRef.current = new Map({
      container: mapContainer.current,
      style: 'https://americanamap.org/style.json',
      center: [37.6176, 55.7558],
      zoom: 5,
      maxZoom: 18,
    }));

    markerRef.current = new Marker().setLngLat([12.550343, 55.665957]).addTo(map);

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
      const svgImage = new Image(28, 28);
      svgImage.onload = () => {
        map.addImage('airplane', svgImage);
      };

      const planeSVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="none">
        <g>
          <path fill="#0058ff" stroke-linecap="round" stroke-linejoin="round" stroke="#000000" stroke-width="0.7" d="M21 16.2632V14.3684L13.4211 9.63158V4.42105C13.4211 3.63474 12.7863 3 12 3C11.2137 3 10.5789 3.63474 10.5789 4.42105V9.63158L3 14.3684V16.2632L10.5789 13.8947V19.1053L8.68421 20.5263V21.9474L12 21L15.3158 21.9474V20.5263L13.4211 19.1053V13.8947L21 16.2632Z"/>
        </g>
      </svg>`;

      svgImage.src = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(planeSVG);

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
          'icon-size': 1.3,
          'icon-allow-overlap': true,
          'icon-rotate': ['get', 'direction'],
          'icon-rotation-alignment': 'map',
        },
      });

      map.on('click', 'planes-layer', (e: any) => {
        const features: any = map.queryRenderedFeatures(e.point, {
          layers: ['planes-layer'],
        });
        if (!features || !features[0]) return;

        const feature = features[0];
        const props = feature.properties!;
        const coords = feature.geometry.coordinates.slice();

        activePlane.current = props.hex;

        if (!popupRef.current) {
          popupRef.current = new Popup({ className: 'map-frame__popup', closeButton: false, offset: 10 });
        }

        popupRef.current.setLngLat(coords).setHTML(popupHTML(props)).addTo(map);

        popupRef.current?.on('close', () => {
          activePlane.current = null;
        });
      });

      map.on('mouseenter', 'planes-layer', () => {
        map.getCanvas().style.cursor = 'pointer';
      });

      map.on('mouseleave', 'planes-layer', () => {
        map.getCanvas().style.cursor = '';
      });

      initUserLocation();
    });
  }, []);

  const initUserLocation = () => {
    if (!navigator.geolocation) {
      startAutoUpdate(55.7558, 37.6176);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const lat = pos.coords.latitude;
        const lon = pos.coords.longitude;

        userPos.current = { lat, lon };

        mapRef.current?.setCenter([lon, lat]);
        mapRef.current?.setZoom(9);
        markerRef.current?.setLngLat([lon, lat]);

        startAutoUpdate(lat, lon);
      },
      () => {
        console.warn('Geolocation denied, using fallback');
        startAutoUpdate(55.7558, 37.6176);
      },
    );
  };

  const startAutoUpdate = (lat: number, lon: number) => {
    updatePlanes(lat, lon);
    setInterval(() => updatePlanes(lat, lon), 2000);
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
            icon: 'oneway_black',
            type: p.type ?? null,
            speed: p.speed ?? null,
            alt: p.alt ?? null,
            direction: p.direction,
          },
        })),
    };

    const source = mapRef.current.getSource('planes') as GeoJSONSource;
    source.setData(geojson);

    if (activePlane.current && popupRef.current) {
      const updated = rawPlanes.find((p: any) => p.hex === activePlane.current);

      if (!updated) {
        popupRef.current.remove();
        activePlane.current = null;
        return;
      }

      popupRef.current.setLngLat([updated.lon, updated.lat]).setHTML(popupHTML(updated));
    }
  };

  const setMapLanguage = (map: Map, lang: string) => {
    if (!map) return;
    const nameField = `name:${lang}`;

    map.getStyle().layers.forEach((layer) => {
      if (
        layer.type === 'symbol' &&
        layer.layout &&
        (layer.layout['text-field'] || layer.layout['text-field'] === '')
      ) {
        map.setLayoutProperty(layer.id, 'text-field', ['coalesce', ['get', nameField], ['get', 'name']]);
      }
    });
  };

  return (
    <div className="map-frame" ref={mapContainer} style={{ width: '100%', height: '100vh' }}>
      <div className="language-switcher">
        <select
          className="language-switcher__select"
          name="lang"
          onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setMapLanguage(mapRef.current!, e.target.value)}
        >
          <option value="" selected>
            -- Выберите язык --
          </option>
          <option value="ru">Русский</option>
          <option value="en">English</option>
          <option value="es">Español</option>
          <option value="de">Deutsch</option>
          <option value="kk">Қазақша</option>
          <option value="ja">日本語</option>
          <option value="fr">Français</option>
          <option value="zh">中文</option>
          <option value="ko">한국어</option>
        </select>
      </div>
    </div>
  );
};
