import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react-swc';
import path from 'path';

// https://vitejs.dev/config
export default defineConfig({
  plugins: [react()],
  root: './src/view',
  base: './',
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
      '@/main': path.resolve(__dirname, 'src/main'),
      '@/view': path.resolve(__dirname, 'src/view'),
      '@/types': path.resolve(__dirname, 'src/types')
    }
  },
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