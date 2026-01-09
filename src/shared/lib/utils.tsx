import { ICAO_NATIONALITY_MARKS } from './ICAO';
import { Language } from './types';

export function getCountryByICAO(icao: string, lan: Language) {
  const prefix = icao
    .slice(0, 2)
    .replace(/[^a-zA-Z0-9]/g, '')
    .toUpperCase();
  const nation = ICAO_NATIONALITY_MARKS.find((obj) => obj.codes.includes(prefix));
  if (nation) return nation[lan];
}
