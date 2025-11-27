import React from 'react';
import './App.sass';
import { Map, Map as MapLibreMap, GeolocateControl, NavigationControl } from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';

// const style: string | StyleSpecification | undefined = {
//   "version": 8,
//   "sources": {
//     "osm": {
//       "type": "raster",
//       "tiles": ["https://a.tile.openstreetmap.org/{z}/{x}/{y}.png"],
//       "tileSize": 256,
//       "attribution": "&copy; OpenStreetMap Contributors",
//       "maxzoom": 19
//     }
//   },
//   "layers": [
//     {
//       "id": "osm",
//       "type": "raster",
//       "source": "osm"
//     }
//   ]
// };

export const App = () => {
  const mapContainer = React.useRef<HTMLDivElement | null>(null);
  const mapRef = React.useRef<MapLibreMap | null>(null);

  React.useEffect(() => {
    if (mapRef.current || !mapContainer.current) return;

    mapRef.current = new Map({
      container: mapContainer.current,
      // style: style,
      // style: 'https://tiles.versatiles.org/assets/styles/colorful/style.json',
      style: 'https://americanamap.org/style.json',
      center: [15, 30],
      // center: [98, 64],
      // style: 'https://api.maptiler.com/maps/019ac204-df7d-7ada-844d-03122bbe7998/style.json?key=4L19oIKyIKZK0Cqronn5',
      // center: [73.5, 63],
      zoom: 1.4,
      maxZoom: 18,
      maxPitch: 85,
    });

    // mapRef.current.on('load', () => {
    //   if (!mapRef.current) return;
    //   mapRef.current.setLayoutProperty('label_country', 'text-field', [
    //     'format',
    //     ['get', 'name_en'],
    //     {'font-scale': 1.2},
    //     '\n',
    //     {},
    //     ['get', 'name'],
    //     {
    //       'font-scale': 0.8,
    //       'text-font': [
    //         'literal',
    //         ['Noto Sans Regular']
    //       ]
    //     }
    //   ]);
    // });

    mapRef.current.addControl(
      new GeolocateControl({
        fitBoundsOptions: { maxZoom: 20 },
        positionOptions: { enableHighAccuracy: true },
        trackUserLocation: true,
      }),
    );
    mapRef.current.addControl(new NavigationControl());
  }, []);

  return (
    <React.Fragment>
      <div ref={mapContainer} style={{ width: '100%', height: '100vh' }} />
    </React.Fragment>
  );
};
