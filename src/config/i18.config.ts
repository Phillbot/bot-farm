import path from 'path';
import { I18n } from 'i18n';

export const t = new I18n({
  locales: ['en', 'uk'],
  defaultLocale: 'en',
  directory: path.join(__dirname, '../locales'),
});
