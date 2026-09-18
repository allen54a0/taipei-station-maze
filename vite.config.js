import { defineConfig } from 'vite';

// GitHub Pages 部署位置：https://allen54a0.github.io/taipei-station-maze/
// production build 用 '/taipei-station-maze/'，dev 用 '/'
export default defineConfig(({ command }) => ({
  base: command === 'build' ? '/taipei-station-maze/' : '/',
  server: {
    host: true,
    port: 5173,
    strictPort: false,
  },
  build: {
    outDir: 'dist',
    sourcemap: true,
  },
}));
