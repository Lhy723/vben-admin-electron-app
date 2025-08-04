// electron/preload.js

// 这里可以放一些安全的、用于主进程和渲染进程通信的代码
// 例如使用 contextBridge 暴露 API 给你的 Vue 应用
const { contextBridge, ipcRenderer } = require('electron');

// 暴露安全的API给渲染进程
contextBridge.exposeInMainWorld('electronAPI', {
  closeWindow: () => ipcRenderer.send('close-window'),
  getAppName: () => ipcRenderer.invoke('get-app-name'),

  // 系统信息API
  getAppVersion: () => ipcRenderer.invoke('get-app-version'),
  isMaximized: () => ipcRenderer.invoke('is-maximized'),

  maximizeWindow: () => ipcRenderer.send('maximize-window'),
  // 窗口控制API
  minimizeWindow: () => ipcRenderer.send('minimize-window'),
  // 监听事件
  on: (channel, func) =>
    ipcRenderer.on(channel, (event, ...args) => func(...args)),
  once: (channel, func) =>
    ipcRenderer.once(channel, (event, ...args) => func(...args)),
  onMessage: (callback) =>
    ipcRenderer.on('reply', (_event, value) => callback(value)),

  readFile: (filePath) => ipcRenderer.invoke('read-file', filePath),
  removeAllListeners: (channel) => ipcRenderer.removeAllListeners(channel),
  // 文件系统API
  selectDirectory: () => ipcRenderer.invoke('select-directory'),

  // 示例API - 可根据需要扩展
  sendMessage: (message) => ipcRenderer.send('message', message),

  // 通知API
  showNotification: (title, body) =>
    ipcRenderer.send('show-notification', title, body),
  unmaximizeWindow: () => ipcRenderer.send('unmaximize-window'),
  writeFile: (filePath, data) =>
    ipcRenderer.invoke('write-file', filePath, data),
});

console.log('Electron preload script loaded');
