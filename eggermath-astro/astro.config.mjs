import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

export default defineConfig({
  site: 'https://www.eggermath.com',
  integrations: [sitemap()],
  output: 'static',
  trailingSlash: 'never',
  build: {
    format: 'file',
  },
});
