import React, { FC } from 'react';
import { PlaneProps } from '../../types';

const ICON = `M21 16.2632V14.3684L13.4211 9.63158V4.42105C13.4211
  3.63474 12.7863 3 12 3C11.2137 3 10.5789 3.63474 10.5789 4.42105V9.63158L3 14.3684V16.2632L10.5789
  13.8947V19.1053L8.68421 20.5263V21.9474L12 21L15.3158 21.9474V20.5263L13.4211 19.1053V13.8947L21 16.2632Z`;


const Plane: FC<PlaneProps> = ({size}) => {
  return (
    <svg
      className="plane"
      height={size}
      viewBox="0 0 24 24"
    >
      <path d={ICON} />
    </svg>
  );
}

export default React.memo(Plane);