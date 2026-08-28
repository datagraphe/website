import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
const excluded = new Set(['/404/', '/contact/', '/comparatifs/']);

export default defineConfig({
  site: 'https://datagraphe.com',
  trailingSlash: 'always',
  integrations: [sitemap({ filter: (page) => !excluded.has(new URL(page).pathname) })],
  output: 'static',
});
