import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

import ru from '@shared/lib/i18n/locales/ru.json';
import en from '@shared/lib/i18n/locales/en.json';
import kk from '@shared/lib/i18n/locales/kk.json';
import ja from '@shared/lib/i18n/locales/ja.json';

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
