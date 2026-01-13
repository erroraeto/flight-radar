import { Projection } from '@shared/lib/types';

export interface ButtonProjectionProps {
  onMapMode: () => void;
  mapMode: Projection;
}
