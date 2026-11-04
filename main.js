// 上班鼓励器 - Electron 主进程
const { app, BrowserWindow, ipcMain, Tray, Menu, nativeImage, screen } = require('electron');
const path = require('path');
const fs = require('fs');

const isMac = process.platform === 'darwin';

// ---------- 设置持久化 ----------
const DEFAULT_SETTINGS = {
  salary: 10000,          // 月薪
  workStart: '09:00',     // 上班时间
  workEnd: '18:00',       // 下班时间
  workDays: [1, 2, 3, 4, 5], // 工作日（0=周日）
  payDay: 10,             // 发薪日
  theme: 'red',           // red | green
  alwaysOnTop: true,
  opacity: 0.92
};

function settingsPath() {
  return path.join(app.getPath('userData'), 'settings.json');
}

function loadSettings() {
  try {
    const raw = fs.readFileSync(settingsPath(), 'utf-8');
    return { ...DEFAULT_SETTINGS, ...JSON.parse(raw) };
  } catch {
    return { ...DEFAULT_SETTINGS };
  }
}

function saveSettings(s) {
  try {
    fs.writeFileSync(settingsPath(), JSON.stringify(s, null, 2), 'utf-8');
  } catch (e) {
    console.error('保存设置失败', e);
  }
}

let settings = loadSettings();
let widgetWin = null;
let settingsWin = null;
let tray = null;

// ---------- 窗口 ----------
function createWidgetWindow() {
  const { width, height } = screen.getPrimaryDisplay().workAreaSize;
  widgetWin = new BrowserWindow({
    width: 340,
    height: 170,
    x: width - 360,
    y: height - 210,
    frame: false,
    transparent: true,
    resizable: false,
    alwaysOnTop: settings.alwaysOnTop,
    skipTaskbar: true,
    hasShadow: false,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false
    }
  });
  widgetWin.setOpacity(settings.opacity);
  widgetWin.loadFile(path.join(__dirname, 'renderer', 'index.html'));
  widgetWin.setMenu(null);
}

function openSettingsWindow() {
  if (settingsWin && !settingsWin.isDestroyed()) {
    settingsWin.focus();
    return;
  }
  settingsWin = new BrowserWindow({
    width: 400,
    height: 560,
    frame: true,
    resizable: false,
    autoHideMenuBar: true,
    title: '上班鼓励器 - 设置',
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false
    }
  });
  settingsWin.setMenu(null);
  settingsWin.loadFile(path.join(__dirname, 'renderer', 'settings.html'));
  settingsWin.on('closed', () => { settingsWin = null; });
}

// ---------- 托盘 ----------
function createTray() {
  const size = 16;
  const canvas = Buffer.alloc(size * size * 4, 0);
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const dx = x - size / 2 + 0.5, dy = y - size / 2 + 0.5;
      if (dx * dx + dy * dy <= (size / 2 - 1) * (size / 2 - 1)) {
        const i = (y * size + x) * 4;
        canvas[i] = 245; canvas[i + 1] = 84; canvas[i + 2] = 84; canvas[i + 3] = 255;
      }
    }
  }
  const img = nativeImage.createFromBuffer(canvas, { width: size, height: size });
  tray = new Tray(img);
  tray.setToolTip('上班鼓励器');
  tray.setContextMenu(Menu.buildFromTemplate([
    { label: '打开设置', click: openSettingsWindow },
    {
      label: '窗口置顶', type: 'checkbox', checked: settings.alwaysOnTop, click: (item) => {
        settings.alwaysOnTop = item.checked;
        saveSettings(settings);
        if (widgetWin) widgetWin.setAlwaysOnTop(item.checked);
      }
    },
    { type: 'separator' },
    { label: '退出', click: () => app.quit() }
  ]));
  tray.on('click', () => {
    if (widgetWin) widgetWin.isVisible() ? widgetWin.hide() : widgetWin.show();
  });
}

// ---------- IPC ----------
ipcMain.handle('get-settings', () => settings);
ipcMain.handle('save-settings', (_e, next) => {
  settings = { ...settings, ...next };
  saveSettings(settings);
  if (widgetWin && !widgetWin.isDestroyed()) {
    widgetWin.setAlwaysOnTop(settings.alwaysOnTop);
    widgetWin.setOpacity(settings.opacity);
    widgetWin.webContents.send('settings-changed', settings);
  }
  return settings;
});
ipcMain.on('open-settings', openSettingsWindow);
ipcMain.on('quit-app', () => app.quit());

// 单实例
const gotLock = app.requestSingleInstanceLock();
if (!gotLock) {
  app.quit();
} else {
  app.whenReady().then(() => {
    createWidgetWindow();
    createTray();
    if (isMac && app.dock) app.dock.hide(); // 纯挂件，不占 Dock
  });

  app.on('window-all-closed', (e) => {
    // 挂件常驻托盘，不退出
    e.preventDefault?.();
  });
}
