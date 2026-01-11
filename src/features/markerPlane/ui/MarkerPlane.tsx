import React, { FC } from 'react';
import { MarkerPlaneProps } from '../model/types';
import { Marker } from 'react-map-gl/maplibre';

export const MarkerPlane: FC<MarkerPlaneProps> = ({ plane, onClick, size = 30 }) => {
  return (
    <Marker
      longitude={plane.lon}
      latitude={plane.lat}
      rotation={plane.direction}
      anchor="bottom"
      onClick={(e: any) => {
        e.originalEvent.stopPropagation();
        onClick();
      }}
    >
      <svg
        style={{
          cursor: 'pointer',
          fill: '#007cff',
          filter: 'drop-shadow(0 0 2px rgba(0, 124, 255, 0.7))',
        }}
        height={size}
        viewBox="0 0 24 24"
      >
        <path
          d="M21 16.2632V14.3684L13.4211 9.63158V4.42105C13.4211
          3.63474 12.7863 3 12 3C11.2137 3 10.5789 3.63474 10.5789 4.42105V9.63158L3 14.3684V16.2632L10.5789
          13.8947V19.1053L8.68421 20.5263V21.9474L12 21L15.3158 21.9474V20.5263L13.4211 19.1053V13.8947L21 16.2632Z"
        />
      </svg>
    </Marker>
  );
};
