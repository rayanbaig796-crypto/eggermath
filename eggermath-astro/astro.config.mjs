import { defineConfig } from 'astro/config';

export default defineConfig({
  site: 'https://www.eggermath.com',
  integrations: [],
  output: 'static',
  trailingSlash: 'never',
  build: {
    format: 'file',
  },
});
