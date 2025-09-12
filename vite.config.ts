import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import path from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  root: './src/view', // 只打包渲染进程文件
  base: './', // 这里很关键，配置 Electron 通过相对路径来访问资源文件
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
      '@/main': path.resolve(__dirname, 'src/main'),
      '@/view': path.resolve(__dirname, 'src/view'),
      '@/types': path.resolve(__dirname, 'src/types'),
      '@/utils': path.resolve(__dirname, 'src/view/utils'),
      '@/services': path.resolve(__dirname, 'src/view/services'),
      '@/components': path.resolve(__dirname, 'src/view/components')
    }
  },
  build: {
    // 渲染进程打包后的路径，嗯……这里由于修改了 root ，所以需要补充一下相对路径
    outDir: '../../dist/view', 
  },
})
