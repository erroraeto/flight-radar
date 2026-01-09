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
