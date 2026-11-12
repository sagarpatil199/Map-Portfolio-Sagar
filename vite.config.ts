import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// base: './' makes the build work from any folder:
// https://username.github.io/  or  https://username.github.io/repo-name/
export default defineConfig({
  base: './',
  plugins: [react()],
  build: {
    target: 'es2020',
    chunkSizeWarningLimit: 1200,
  },
});
