import { defineConfig } from 'astro/config';
import tailwind from '@astrojs/tailwind';
import mdx from '@astrojs/mdx';
import cloudflare from '@astrojs/cloudflare';

export default defineConfig({
  site: 'https://scoutpack261.com',
  integrations: [
    tailwind(),
    mdx(),
  ],
  output: 'hybrid',
  adapter: cloudflare(),
});
