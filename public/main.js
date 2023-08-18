const { app, BrowserWindow, ipcMain } = require('electron');
const isDev = require('electron-is-dev')
const path = require('path');

require('@electron/remote/main').initialize();

process.env['ELECTRON_DISABLE_SECURITY_WARNINGS'] = 'true';

let mainWindow;

// The main process' primary purpose is to create and manage application windows with the BrowserWindow module.
const createWindow = () =>
{
    mainWindow = new BrowserWindow({
        width: 1000,
        height: 860,
        minHeight: 860,
        maxHeight: 1860,
        // frame: false, removes the frame
        // titleBarStyle: 'hidden', removes the title bar
        // transparent: true, makes the app completely transparent except for the top-right buttons
        titleBarStyle: 'hidden',
        titleBarOverlay: {
            color: 'white',
            symbolColor: '#404040',
            height: 30
        },
        webPreferences:
        {
            enableRemoteModule: true,
            // Attach a preload script to the main process in the BrowserWindow. This script will be executed before other scripts in the renderer process.
            preload: path.join(__dirname, 'preload.js')
        }
    });

    //Remove menu bar
    mainWindow.removeMenu();

    // Each instance of the BrowserWindow class creates an application window that loads a web page in a separate renderer process.
    // You can interact with this web content from the main process using the window's webContents object.
    mainWindow.webContents.openDevTools();

    mainWindow.loadURL(isDev ? 'http://localhost:3000' : `file://${path.join(__dirname, '../build/index.html')}`);
}

const openApp = (event, url) =>
{
    const childWindow = new BrowserWindow({
        parent: mainWindow,
        modal: false,
        show: true,
        width: 800,
        height: 600,
        webPreferences: { nodeIntegration: true }
    });

    childWindow.removeMenu();
    childWindow.loadURL(url);
}

app.whenReady().then(() =>
{
    ipcMain.handle('logVersions', (event, args) => `Logging node version: ${process.versions.node}, chrome version: ${process.versions.chrome}, and electron version: ${process.versions.electron}`);
    ipcMain.on('openApp', openApp);
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



