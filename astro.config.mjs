import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
export default defineConfig({ site: 'https://datagraphe.com', integrations: [sitemap()], output: 'static' });
