import React from 'react';
import './MapFrame.sass';
import { Map, GeolocateControl, NavigationControl, GeoJSONSource, Marker, Popup } from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';

export const MapFrame = () => {
  const mapContainer = React.useRef<HTMLDivElement>(null);
  const mapRef = React.useRef<Map>(null);
  const markerRef: React.RefObject<any> = React.useRef(null);
  const userPos = React.useRef<{ lat: number; lon: number }>(null);

  const activePlane = React.useRef<any>(null);
  const popupRef = React.useRef<Popup>(null);
  const popupHTML = (p: any) => `
    <div style="font-size:13px">
      <strong>${getRegionFromHex(p.icao) || '?'}</strong><br/>
      <b>Type:</b> ${p.type || '—'}<br/>
      <b>Speed:</b> ${p.speed ? p.speed + ' km/h' : '—'}<br/>
      <b>Altitude:</b> ${p.alt ? p.alt + ' m' : '—'}<br/>
      <b>Track:</b> ${p.direction ?? '—'}°
    </div>
  `;
  const ICAO_COUNTRIES: Record<string, string> = {
    '424': 'Russia',
    '43F': 'Russia',
    '508': 'Kazakhstan',
    '511': 'Belarus',
    '514': 'Ukraine',
    '400': 'United Kingdom',
    '3D0': 'Germany',
    '344': 'France',
    '45C': 'Spain',
    '06A': 'Italy',
    '780': 'China',
    '800': 'Japan',
    '71C': 'South Korea',
    A00: 'USA',
    A20: 'USA',
    C00: 'Canada',
  };

  const getRegionFromHex = (hex: string): string => {
    if (!hex) return 'Unknown';
    const prefix = hex.substring(0, 3).toUpperCase();
    return ICAO_COUNTRIES[prefix] ?? 'Unknown';
  };

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
      map.addSource('planes', {
        type: 'geojson',
        data: { type: 'FeatureCollection', features: [] },
      });

      map.addLayer({
        id: 'planes-layer',
        type: 'symbol',
        source: 'planes',
        layout: {
          'icon-image': 'oneway_black',
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

        activePlane.current = props;

        if (!popupRef.current) {
          popupRef.current = new Popup({ closeOnClick: false });
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
        alt: plane.alt_baro,
        speed: plane.gs,
        track: plane.track,
        callsign: plane.flight,
        icao: plane.hex,
        type: plane.t,
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
            icao: p.icao,
            direction: p.track ?? 0,
            flight: p.callsign ?? null,
            type: p.type ?? null,
            alt: p.alt ?? null,
            speed: p.speed ?? null,
            icon: 'oneway_black',
          },
        })),
    };

    const source = mapRef.current.getSource('planes') as GeoJSONSource;
    source.setData(geojson);

    if (activePlane.current && popupRef.current) {
      const updated = rawPlanes.find((p: any) => p.callsign === activePlane.current.flight);

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
