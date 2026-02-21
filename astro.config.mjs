import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import tailwind from '@astrojs/tailwind';
import netlify from '@astrojs/netlify';

// https://astro.build/config
export default defineConfig({
  site: 'https://ai-dialogos.com',
  output: 'static', // Static by default, can add prerender: false to specific pages for SSR
  adapter: netlify(),
  integrations: [
    react(),
    tailwind({ applyBaseStyles: false }), // Let globals.css control base styles
  ],
  server: { port: 4321 },
});
