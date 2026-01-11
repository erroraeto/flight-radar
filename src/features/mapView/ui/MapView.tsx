import React, { useRef, useEffect, useMemo } from 'react';
import { Layer, Map, MapRef, Source } from 'react-map-gl/maplibre';
import 'maplibre-gl/dist/maplibre-gl.css';
import 'map-gl-style-switcher/dist/map-gl-style-switcher.css';
import { fetchPlanes } from '../../../shared/lib/FetchPlanes';
import { Box } from '@mui/material';
import { PoppupPlaneInfo } from '../../poppupPlaneInfo';

import { useAppDispatch, useAppSelector } from '../../../app/hooks';
import { setViewState, setPlanes, setTargetPlane } from '../index';
import { setGeoStatus } from '../../buttonLocation/';
import { MarkerPlane } from '../../markerPlane';

export const MapView = () => {
  // // const mapStyle: string = `https://tiles.openfreemap.org/styles/bright`;
  // // const mapStyle: string = `https://api.maptiler.com/maps/019ac1e2-7e58-7804-baec-880aab07fcd5/style.json?key=4L19oIKyIKZK0Cqronn5`;
  // // const mapStyle: string = `https://basemaps.cartocdn.com/gl/positron-gl-style/style.json`;
  // // const mapStyle: string = `https://api.maptiler.com/maps/019ac204-df7d-7ada-844d-03122bbe7998/style.json?key=4L19oIKyIKZK0Cqronn5`;
  // // const mapStyle: string = `https://api.maptiler.com/maps/streets-v4-dark/style.json?key=4L19oIKyIKZK0Cqronn5`;

  const dispatch = useAppDispatch();
  const { view, theme, mapMode, planes, targetPlane } = useAppSelector((state) => state.map);
  const { geoLocate, geoStatus } = useAppSelector((state) => state.location);
  const { lang } = useAppSelector((state) => state.language);
  const mapStyle: string[] = [`/map-style__light.json`, `/map-style__dark.json`];
  const mapRef = useRef<MapRef | null>(null);
  const timer = useRef<number>(null);
  useEffect(() => {
    if (!geoLocate) return;
    mapRef.current?.flyTo({
      center: geoLocate,
      zoom: 5,
      duration: 1000,
    });
    const loadPlanes = async () => {
      const [lon, lat] = geoLocate;
      const rawPlanes = await fetchPlanes(lon, lat);
      dispatch(setPlanes(rawPlanes));
    };
    loadPlanes();
    if (timer.current) {
      clearInterval(timer.current);
    }
    timer.current = window.setInterval(loadPlanes, 2000);
  }, [geoLocate]);
  const activePlane: any = useMemo(() => {
    if (!targetPlane) return null;
    return planes?.find((p: any) => p.hex === targetPlane) ?? null;
  }, [planes, targetPlane]);
  useEffect(() => {
    mapRef.current?.zoomTo(view.zoom, { duration: 300 });
  }, [view.zoom]);

  const setMapLanguage = () => {
    const map = mapRef.current?.getMap();
    if (!map) return;

    const style = map.getStyle();
    if (!style?.layers) return;

    style.layers.forEach((layer: any) => {
      if (
        layer.type === 'symbol' &&
        layer.layout?.['text-field'] &&
        layer.layout?.['text-field']?.[0] != 'to-string'
        // && layer.layout?.['text-field']?.[0] === 'coalesce'
      ) {
        map.setLayoutProperty(layer.id, 'text-field', ['coalesce', ['get', `name:${lang}`], ['get', 'name']]);
      }
    });
  };
  useEffect(() => {
    setMapLanguage();
  }, [lang]);

  return (
    <Box sx={{ position: 'relative', width: '100%', height: '100dvh' }}>
      <Map
        ref={mapRef}
        initialViewState={view}
        attributionControl={false}
        onStyleData={() => setMapLanguage()}
        onMoveStart={(e: any) => {
          if (e.originalEvent && geoStatus != 'searching' && geoStatus != 'off') {
            dispatch(setGeoStatus('manual'));
          }
        }}
        onMoveEnd={(e: any) => dispatch(setViewState(e.viewState))}
        onClick={() => dispatch(setTargetPlane(null))}
        maxZoom={18}
        style={{
          width: '100%',
          height: '100dvh',
          transition: 'all .3s ease',
        }}
        mapStyle={theme == 'dark' ? mapStyle[1] : mapStyle[0]}
        projection={mapMode}
      >
        {geoLocate && (
          <Source
            id="user"
            type="geojson"
            data={{
              type: 'FeatureCollection',
              features: [
                {
                  type: 'Feature',
                  geometry: {
                    type: 'Point',
                    coordinates: geoLocate,
                  },
                  properties: {},
                },
              ],
            }}
          >
            <Layer
              id="user-dot-shadow"
              type="circle"
              paint={{
                'circle-radius': 18,
                'circle-color': '#000',
                'circle-blur': 1.6,
              }}
            />
            <Layer
              id="user-dot"
              type="circle"
              paint={{
                'circle-radius': 6,
                'circle-color': '#007cff',
                'circle-stroke-width': 4,
                'circle-stroke-color': '#fff',
              }}
            />
          </Source>
        )}
        {planes.map((p: any, id: number) => (
          <MarkerPlane
            key={`marker-${id}`}
            plane={p}
            onClick={() => {
              dispatch(setTargetPlane(p.hex));
            }}
          />
        ))}
        {activePlane && (
          <PoppupPlaneInfo theme={theme} activePlane={activePlane} onClose={() => dispatch(setTargetPlane(null))} />
        )}
      </Map>
    </Box>
  );
};
