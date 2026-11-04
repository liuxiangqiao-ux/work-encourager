// scripts/selftest.js —— 自检：渲染挂件与设置页并截图，结束后自动退出
const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');

const DEFAULT_SETTINGS = {
  salary: 10000, workStart: '09:00', workEnd: '18:00',
  workDays: [1, 2, 3, 4, 5], payDay: 10, theme: 'red',
  alwaysOnTop: true, opacity: 0.92
};

ipcMain.handle('get-settings', () => DEFAULT_SETTINGS);
ipcMain.handle('save-settings', (_e, s) => s);
ipcMain.on('open-settings', () => {});
ipcMain.on('quit-app', () => app.quit());

async function shoot(file, url, w, h, out) {
  const win = new BrowserWindow({
    width: w, height: h, show: false, backgroundColor: '#1b1d24',
    webPreferences: { preload: path.join(__dirname, '..', 'preload.js'), contextIsolation: true }
  });
  await win.loadFile(url);
  await new Promise(r => setTimeout(r, 1800));
  const img = await win.webContents.capturePage();
  require('fs').writeFileSync(out, img.toPNG());
  console.log('saved:', out);
  win.destroy();
}

app.whenReady().then(async () => {
  const out = process.argv[2] || __dirname;
  try {
    await shoot('widget', path.join(__dirname, '..', 'renderer', 'index.html'), 340, 170, path.join(out, 'test-widget.png'));
    await shoot('settings', path.join(__dirname, '..', 'renderer', 'settings.html'), 400, 560, path.join(out, 'test-settings.png'));
    console.log('SELFTEST_OK');
  } catch (e) {
    console.error('SELFTEST_FAIL', e);
    process.exitCode = 1;
  } finally {
    app.quit();
  }
});
