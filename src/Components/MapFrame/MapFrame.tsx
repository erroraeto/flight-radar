import React from 'react';
import './MapFrame.sass';
import { Map, GeolocateControl, NavigationControl, GeoJSONSource, Marker, Popup } from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';

export const MapFrame = () => {
  const mapContainer = React.useRef<HTMLDivElement>(null);
  const mapRef = React.useRef<Map>(null);
  const markerRef: React.RefObject<any> = React.useRef(null);
  const userPos = React.useRef<{ lat: number; lon: number }>(null);

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
        data: {
          type: 'FeatureCollection',
          features: [],
        },
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

      initUserLocation();
    });

    map.on('click', 'places', (e: any) => {
      if (!e.features || !e.features[0]) return;
      const coordinates = e.features[0].geometry.coordinates as [number, number];
      const description = e.features[0].properties.description;

      while (Math.abs(e.lngLat.lng - coordinates[0]) > 180) {
        coordinates[0] += e.lngLat.lng > coordinates[0] ? 360 : -360;
      }

      new Popup().setLngLat(coordinates).setHTML(description).addTo(map);
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
          geometry: {
            type: 'Point',
            coordinates: [p.lon, p.lat],
          },
          properties: {
            description: `<strong>${p.callsign}</strong><br/>
              <b>Type</b> ${p.type || '—'}<br/>
              <b>Height</b> ${p.alt || '—'}<br/>
              <b>Speed</b> ${p.speed || '—'}<br/>
              <b>Speed</b> ${p.track || '—'}<br/>`,
            direction: p.track ?? 0,
            flight: p.callsign,
            type: p.type,
            icao: p.icao,
          },
        })),
    };

    const source = mapRef.current.getSource('planes') as GeoJSONSource;
    source.setData(geojson);
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
