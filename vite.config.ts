import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'

import { virtualized } from 'vite-plugin-react-virtualized';


// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(),virtualized()],
  root: './src/view', // 只打包渲染进程文件
  base: './', // 这里很关键，配置 Electron 通过相对路径来访问资源文件
  build: {
    // 渲染进程打包后的路径，嗯……这里由于修改了 root ，所以需要补充一下相对路径
    outDir: '../../dist/view', 
  },
})
