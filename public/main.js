const { app, BrowserWindow, ipcMain } = require('electron');
const isDev = require('electron-is-dev')
const path = require('path');

require('@electron/remote/main').initialize();

function createWindow()
{
    const win = new BrowserWindow({
        width: 1000,
        height: 860,
        minHeight: 860,
        maxHeight: 1860,
        webPreferences:
        {
            enableRemoteModule: true,
            preload: path.join(__dirname, 'preload.js')
        }
    });

    win.webContents.openDevTools();

    win.loadURL(isDev ? 'http://localhost:3000' : `file://${path.join(__dirname, '../build/index.html')}`);
}

app.whenReady().then(() =>
{
    ipcMain.handle('logVersions', (event, args) => `Logging node version: ${process.versions.node}, chrome version: ${process.versions.chrome}, and electron version: ${process.versions.electron}`);
    createWindow();
});

app.on('window-all-closed', () =>
{
    if (process.platform !== 'darwin')
        app.quit();
});

app.on('activate', () =>
{
    if (BrowserWindow.getAllWindows().length === 0)
        createWindow();
});

