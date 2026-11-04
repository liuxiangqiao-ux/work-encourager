// preload.js —— 桥接主进程与渲染进程；在纯浏览器预览时提供 mock
const isElectron = typeof process !== 'undefined' && process.versions && process.versions.electron;

if (isElectron) {
  const { contextBridge, ipcRenderer } = require('electron');
  contextBridge.exposeInMainWorld('encourager', {
    getSettings: () => ipcRenderer.invoke('get-settings'),
    saveSettings: (s) => ipcRenderer.invoke('save-settings', s),
    onSettingsChanged: (cb) => ipcRenderer.on('settings-changed', (_e, s) => cb(s)),
    openSettings: () => ipcRenderer.send('open-settings'),
    quit: () => ipcRenderer.send('quit-app')
  });
} else {
  // 浏览器预览模式：localStorage 持久化 + 默认配置
  const DEFAULTS = {
    salary: 10000, workStart: '09:00', workEnd: '18:00',
    workDays: [1, 2, 3, 4, 5], payDay: 10, theme: 'red',
    alwaysOnTop: true, opacity: 0.92
  };
  const load = () => {
    try { return { ...DEFAULTS, ...JSON.parse(localStorage.getItem('encourager-settings') || '{}') }; }
    catch { return { ...DEFAULTS }; }
  };
  window.encourager = {
    getSettings: async () => load(),
    saveSettings: async (s) => {
      const next = { ...load(), ...s };
      localStorage.setItem('encourager-settings', JSON.stringify(next));
      window.dispatchEvent(new CustomEvent('encourager-settings-changed', { detail: next }));
      return next;
    },
    onSettingsChanged: (cb) => window.addEventListener('encourager-settings-changed', (e) => cb(e.detail)),
    openSettings: () => window.open('settings.html', '_blank', 'width=400,height=560'),
    quit: () => window.close()
  };
}
