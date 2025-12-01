import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react-swc';
import { virtualized } from 'vite-plugin-react-virtualized';

export default defineConfig({
  plugins: [react(), virtualized()],
  root: './src/view',
  base: './',
  build: {
    outDir: '../../.vite/dist/view',
    emptyOutDir: true,
    rollupOptions: {
      input: './src/view/index.html',
    },
  },
  server: {
    port: 5173,
  },
});
