import { defineConfig } from 'vite';
import { resolve } from 'path';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  plugins: [
    tailwindcss()
  ],
  base: './',
  build: {
    rollupOptions: {
      input: {
        // German (DE) pages
        main: resolve(__dirname, 'index.html'),
        gallery: resolve(__dirname, 'gallery/index.html'),
        vita: resolve(__dirname, 'vita/index.html'),
        statement: resolve(__dirname, 'statement/index.html'),
        gt: resolve(__dirname, 'alexkiesslingxgt/index.html'),
        privacy: resolve(__dirname, 'privacy/index.html'),
        
        // English (EN) pages
        en_main: resolve(__dirname, 'en/index.html'),
        en_gallery: resolve(__dirname, 'en/gallery/index.html'),
        en_vita: resolve(__dirname, 'en/vita/index.html'),
        en_statement: resolve(__dirname, 'en/statement/index.html'),
        en_gt: resolve(__dirname, 'en/alexkiesslingxgt/index.html'),
        en_privacy: resolve(__dirname, 'en/privacy/index.html')
      }
    }
  }
});
