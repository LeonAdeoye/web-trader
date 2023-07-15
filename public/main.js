const { app, BrowserWindow } = require('electron');
const isDev = require('electron-is-dev')
const path = require('path');

require('@electron/remote/main').initialize();

function createWindow()
{
    const win = new BrowserWindow({
        width: 1000,
        height: 860,
        minHeight: 860,
        maxHeight: 860,
        webPreferences: { enableRemoteModule: true }
    });

    win.webContents.openDevTools();

    win.loadURL(isDev ? 'http://localhost:3000' : `file://${path.join(__dirname, '../build/index.html')}`);
}

app.whenReady().then(createWindow);

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

