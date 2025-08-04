import Vue from '@vitejs/plugin-vue';
import VueJsx from '@vitejs/plugin-vue-jsx';
import electron from 'vite-plugin-electron';
import renderer from 'vite-plugin-electron-renderer';
import { configDefaults, defineConfig } from 'vitest/config';

export default defineConfig({
  base: './',
  plugins: [
    Vue(),
    VueJsx(),
    electron([
      {
        // 主进程入口文件
        entry: 'electron/main.js',
      },
      {
        // 预加载脚本入口文件
        entry: 'electron/preload.js',
        onstart(options) {
          // 这个 onstart 钩子会在预加载脚本构建完成后调用，
          // 然后我们可以命令 Electron 刷新渲染器。
          options.reload();
        },
      },
    ]),
    renderer({
      // 告诉插件哪些 Node.js 模块是 Vite 应该外部化的，
      // 而不是打包到渲染器代码中。
      nodeIntegration: true,
    }),
  ],
  test: {
    environment: 'happy-dom',
    exclude: [...configDefaults.exclude, '**/e2e/**'],
  },
});
