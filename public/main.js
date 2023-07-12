const { app, BrowserWindow } = require('electron');
const isDev = require('electron-is-dev')
const path = require('path');

// Electron's library to enable IPC communication snd allow a React process to send events to the Electron process.
require('@electron/remote/main').initialize();

function createWindow()
{
    const win = new BrowserWindow({
        width: 1000,
        height: 700,
        webPreferences: {
            enableRemoteModule: true
        }
    });

    win.webContents.openDevTools();

    win.loadURL(
        isDev
            ? 'http://localhost:3000'
            : `file://${path.join(__dirname, '../build/index.html')}`
    )
}

app.whenReady().then(createWindow);

app.on('window-all-closed', () =>
{
    if (process.platform !== 'darwin')
    {
        app.quit();
    }
});

app.on('activate', () =>
{
    if (BrowserWindow.getAllWindows().length === 0)
    {
        createWindow();
    }
});
