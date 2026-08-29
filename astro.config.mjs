import { defineConfig } from 'astro/config';

export default defineConfig({
  site: 'https://datagraphe.com',
  trailingSlash: 'always',
  output: 'static',
  i18n: {
    defaultLocale: 'fr',
    locales: ['fr', 'en', 'de', 'it', 'es'],
    routing: { prefixDefaultLocale: true, redirectToDefaultLocale: false },
  },
});
