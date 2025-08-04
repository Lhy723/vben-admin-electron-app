import { promises as fs } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

// electron/main.js
import { app, BrowserWindow, dialog, ipcMain, Notification } from 'electron';

// 获取 __dirname 的 ES 模块兼容写法
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Vite DEV 服务器 URL。如果VITE_DEV_SERVER_URL存在，则表示处于开发模式
// process.env.VITE_DEV_SERVER_URL 由 vite-plugin-electron 自动注入
const VITE_DEV_SERVER_URL = process.env.VITE_DEV_SERVER_URL;

let mainWindow;

function createWindow() {
  mainWindow = new BrowserWindow({
    // 隐藏菜单栏
    autoHideMenuBar: true,
    height: 800,
    webPreferences: {
      contextIsolation: false,
      enableRemoteModule: true,
      nodeIntegration: true,
      // __dirname 指向的是打包后 dist-electron/main.js 所在的目录
      // 在开发环境下，preload 脚本的路径需要特别处理
      preload: path.join(__dirname, 'preload.js'),
    },
    width: 1200,
  });

  // 在开发环境下加载 Vite 开发服务器的 URL，
  // 在生产环境下加载打包后的 index.html 文件。
  if (VITE_DEV_SERVER_URL) {
    mainWindow.loadURL(VITE_DEV_SERVER_URL);
    // 在开发环境下自动打开开发者工具
    mainWindow.webContents.openDevTools();
  } else {
    // 部署时加载 index.html
    // 修复路径问题：生产环境下的路径应该是相对于应用根目录的
    const indexPath = path.join(__dirname, '../apps/web-ele/dist/index.html');

    // 检查生产环境的 index.html 是否存在
    fs.access(indexPath)
      .then(() => {
        mainWindow.loadFile(indexPath);
      })
      .catch(() => {
        // 如果生产环境的文件不存在，加载测试页面
        const testPath = path.join(__dirname, 'test.html');
        mainWindow.loadFile(testPath);
      });
  }
}

app.whenReady().then(() => {
  createWindow();

  // 当应用激活时重新创建窗口 (macOS)
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });

  // 注册IPC处理程序
  registerIPC();
});

// 除了 macOS 外，当所有窗口都关闭时退出应用。
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

// 处理应用退出
app.on('before-quit', () => {
  // 可以在这里添加清理代码
});

// 处理应用意外退出
app.on('will-quit', () => {
  // 可以在这里添加清理代码
});

// 处理所有窗口关闭
app.on('quit', () => {
  // 可以在这里添加清理代码
});

// 注册IPC处理程序
function registerIPC() {
  // 获取应用信息
  ipcMain.handle('get-app-version', () => app.getVersion());
  ipcMain.handle('get-app-name', () => app.getName());

  // 窗口控制
  ipcMain.on('minimize-window', () => {
    if (mainWindow) mainWindow.minimize();
  });

  ipcMain.on('maximize-window', () => {
    if (mainWindow) {
      if (mainWindow.isMaximized()) {
        mainWindow.unmaximize();
      } else {
        mainWindow.maximize();
      }
    }
  });

  ipcMain.on('unmaximize-window', () => {
    if (mainWindow) mainWindow.unmaximize();
  });

  ipcMain.on('close-window', () => {
    if (mainWindow) mainWindow.close();
  });

  ipcMain.handle('is-maximized', () => {
    return mainWindow ? mainWindow.isMaximized() : false;
  });

  // 文件系统操作
  ipcMain.handle('select-directory', async () => {
    if (mainWindow) {
      const result = await dialog.showOpenDialog(mainWindow, {
        properties: ['openDirectory'],
      });
      if (!result.canceled) {
        return result.filePaths[0];
      }
    }
    return null;
  });

  ipcMain.handle('read-file', async (event, filePath) => {
    try {
      const data = await fs.readFile(filePath, 'utf8');
      return data;
    } catch (error) {
      throw new Error(`Failed to read file: ${error.message}`);
    }
  });

  ipcMain.handle('write-file', async (event, filePath, data) => {
    try {
      await fs.writeFile(filePath, data, 'utf8');
      return true;
    } catch (error) {
      throw new Error(`Failed to write file: ${error.message}`);
    }
  });

  // 显示通知
  ipcMain.on('show-notification', (event, title, body) => {
    if (Notification.isSupported()) {
      new Notification({ body, title }).show();
    }
  });
}
