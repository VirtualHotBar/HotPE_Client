import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react-swc';

// https://vitejs.dev/config
export default defineConfig({
  plugins: [react()],
  root: './src/view',
  base: './',
  build: {
    outDir: '../../dist/view',
    rollupOptions: {
      external: [],
    },
  },
  optimizeDeps: {
    include: ['react-window'],
    force: true,
  },
});