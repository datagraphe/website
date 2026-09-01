import { defineConfig } from 'astro/config';

export default defineConfig({
  site: 'https://datagraphe.com',
  trailingSlash: 'always',
  output: 'static',
  outDir: process.env.ASTRO_OUT_DIR ?? './dist',
  vite: {
    define: {
      'import.meta.env.DATA_SOURCE': JSON.stringify(process.env.DATA_SOURCE ?? 'public-dataset'),
    },
  },
  i18n: {
    defaultLocale: 'fr',
    locales: ['fr', 'en', 'de', 'it', 'es'],
    routing: { prefixDefaultLocale: true, redirectToDefaultLocale: false },
  },
});
