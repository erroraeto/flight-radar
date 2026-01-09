import { Theme } from '../../../shared/lib/types';

export interface ButtonThemeProps {
  onThemeMode: () => void;
  themeMode: Theme;
}
