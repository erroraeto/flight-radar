export interface LocationProps {
  geoLocate: [number, number] | null;
  geoStatus: 'off' | 'searching' | 'fixed' | 'manual';
}
