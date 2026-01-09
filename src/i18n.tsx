import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

import ru from './shared/locales/ru.json';
import en from './shared/locales/en.json';
import kk from './shared/locales/kk.json';
import ja from './shared/locales/ja.json';

void i18n.use(initReactI18next).init({
  lng: 'en',
  fallbackLng: 'en',
  resources: {
    ru: { translation: ru },
    en: { translation: en },
    kk: { translation: kk },
    ja: { translation: ja },
  },
  interpolation: { escapeValue: false },
});

export default i18n;
