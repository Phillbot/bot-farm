import i18n from 'i18next';
import en from '../locales/en/en-US.json';
import uk from '../locales/uk/uk-UA.json';

export const defaultNS = 't';

export const resources = {
  en: {
    t: {
      ...en,
    },
  },

  uk: {
    t: {
      ...uk,
    },
  },
};

i18n.init({
  lng: 'uk',
  debug: process.env.ENV === 'development',
  resources,
  fallbackLng: false,
  interpolation: {
    useRawValueToEscape: true,
  },
});
