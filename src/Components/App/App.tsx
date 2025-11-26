import React from 'react';
import './App.sass';
import { Map, Map as MapLibreMap, GeolocateControl } from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';

export const App = () => {
  const mapContainer = React.useRef<HTMLDivElement | null>(null);
  const mapRef = React.useRef<MapLibreMap | null>(null);

  React.useEffect(() => {
    if (mapRef.current || !mapContainer.current) return;

    mapRef.current = new Map({
      container: mapContainer.current,
      style: 'https://tiles.openfreemap.org/styles/bright',
      // style: 'https://api.maptiler.com/maps/019ac1e2-7e58-7804-baec-880aab07fcd5/style.json?key=4L19oIKyIKZK0Cqronn5',
      center: [111, 63.2],
      zoom: 2.8,
    });

    mapRef.current.addControl(
      new GeolocateControl({
        positionOptions: { enableHighAccuracy: true },
        trackUserLocation: true,
      }),
    );
  }, []);

  return (
    <React.Fragment>
      <div ref={mapContainer} style={{ width: '100%', height: '100vh' }} />
    </React.Fragment>
  );
};
