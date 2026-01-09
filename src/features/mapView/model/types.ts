import { MapRef } from 'react-map-gl/maplibre';
import { Ref } from 'react';

export interface MapState {
  view: {
    latitude: number;
    longitude: number;
    zoom: number;
  };
  theme: 'light' | 'dark';
  mapMode: 'globe' | 'mercator';
  planes: [];
  targetPlane: string | null;
}
