import React from 'react';
import './App.sass';
import Map from 'react-map-gl/maplibre';
import 'maplibre-gl/dist/maplibre-gl.css';
import maplibregl from 'maplibre-gl';
import { Protocol } from 'pmtiles';

export const App = () => {
  React.useEffect(() => {
    let protocol = new Protocol();
    maplibregl.addProtocol('pmtiles', protocol.tile);
    return maplibregl.removeProtocol('pmtiles');
  }, []);

  return (
    <React.Fragment>
      <Map
        style={{ width: 600, height: 400 }}
        mapStyle={{
          version: 8,
          sources: {
            sample: {
              type: 'vector',
              url: 'https://r2-public.protomaps.com/protomaps-sample-datasets/cb_2018_us_zcta510_500k.pmtiles',
            },
          },
          layers: [
            {
              id: 'zcta',
              source: 'sample',
              'source-layer': 'zcta',
              type: 'line',
              paint: {
                'line-color': '#999',
              },
            },
          ],
        }}
        mapLib={maplibregl}
      />
    </React.Fragment>
  );
};
