import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react-swc';
import { virtualized } from 'vite-plugin-react-virtualized';

// https://vitejs.dev/config
export default defineConfig({
  plugins: [react(), virtualized()],
  root: './src/view',
  base: './',
  build: {
    outDir: '../../dist/view',
  },
});