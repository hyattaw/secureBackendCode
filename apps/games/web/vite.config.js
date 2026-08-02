import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  base: '/',
  resolve: {
    alias: {
      '@drewhyatt/ui': path.resolve(__dirname, '../../packages/ui'),
      '@drewhyatt/core': path.resolve(__dirname, '../../packages/core'),
      '@drewhyatt/minigames': path.resolve(__dirname, '../../packages/minigames'),
      '@drewhyatt/assets': path.resolve(__dirname, '../../packages/assets')
    }
  },
  assetsInclude: ['**/*.svg']
});