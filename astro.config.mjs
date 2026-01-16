import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import tailwind from '@astrojs/tailwind';
import netlify from '@astrojs/netlify';

// https://astro.build/config
export default defineConfig({
  site: 'https://example.com', // Update with actual domain when ready
  output: 'hybrid', // Changed from static to enable serverless functions
  adapter: netlify(),
  integrations: [
    react(),
    tailwind({ applyBaseStyles: false }), // Let globals.css control base styles
  ],
  server: { port: 4321 },
});
