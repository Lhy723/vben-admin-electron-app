import { defineConfig } from '@vben/vite-config';
import electron from 'vite-plugin-electron/simple';

import ElementPlus from 'unplugin-element-plus/vite';

export default defineConfig(async () => {
  return {
    application: {},
    vite: {
      plugins: [
        // Electron插件
        electron({
          main: {
            entry: 'electron/main.js',
            vite: {
              build: {
                outDir: 'dist-electron/main',
              },
            },
          },
          preload: {
            input: 'electron/preload.js',
            vite: {
              build: {
                outDir: 'dist-electron/preload',
              },
            },
          },
        }),
        ElementPlus({
          format: 'esm',
        }),
      ],
      server: {
        proxy: {
          '/api': {
            changeOrigin: true,
            rewrite: (path) => path.replace(/^\/api/, ''),
            // mock代理目标地址
            target: 'http://localhost:5320/api',
            ws: true,
          },
        },
      },
    },
  };
});