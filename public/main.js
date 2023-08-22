const { app, BrowserWindow, ipcMain } = require('electron');
const isDev = require('electron-is-dev')
const path = require('path');

require('@electron/remote/main').initialize();

process.env['ELECTRON_DISABLE_SECURITY_WARNINGS'] = 'true';

let mainWindow;

// create amp of child windows objects keyed by destination IDs
const childWindowsMap = new Map();

// The main process' primary purpose is to create and manage application windows with the BrowserWindow module.
const createWindow = () =>
{
    mainWindow = new BrowserWindow({
        width: 1000,
        height: 860,
        minHeight: 860,
        maxHeight: 1860,
        title: 'Launch Pad',
        frame: true,
        titleBarOverlay: {
            symbolColor: '#404040',
            height: 30
        },
        webPreferences:
        {
            nodeIntegration: true,
            webSecurity: false,
            enableRemoteModule: true,
            // Attach a preload script to the main process in the BrowserWindow. This script will be executed before other scripts in the renderer process.
            preload: path.join(__dirname, 'preload.js')
            //preload: path.join(__dirname, '../dist/preload.bundle.js'), // Path to bundled preload script if webpack is used to bundle preload.js
        }
    });

    //Remove menu bar
    mainWindow.removeMenu();

    // Each instance of the BrowserWindow class creates an application window that loads a web page in a separate renderer process.
    // You can interact with this web content from the main process using the window's webContents object.
    mainWindow.webContents.openDevTools();
    mainWindow.loadURL(isDev ? 'http://localhost:3000' : `file://${path.join(__dirname, '../build/index.html')}`);
}

const openApp = (event, {url, title}) =>
{
    const childWindow = new BrowserWindow({
        parent: mainWindow,
        title: `${title}`,
        id: title,
        modal: false,
        show: true,
        frame: true,
        width: 800,
        height: 600,
        webPreferences: { nodeIntegration: true, preload: path.join(__dirname, 'preload.js') }
    });

    childWindow.removeMenu();
    childWindow.webContents.openDevTools();
    childWindow.loadURL(url).then(() => console.log("Child window created with title: " + childWindow.getTitle()));
    childWindowsMap.set(childWindow.getTitle(), childWindow);
}

const handleMessageFromRenderer = (_, fdc3Context, destination, source) =>
{
    // To send a message from main.js to a renderer process, use the webContents.send method on the target child window's webContents.
    childWindowsMap.get(destination).webContents.send("message-to-renderer", destination, fdc3Context, source);
    console.log("Message sent to child window: " + destination + " with context: " + JSON.stringify(fdc3Context));
}

app.whenReady().then(() =>
{
    ipcMain.on('openApp', openApp);
    ipcMain.on('message-to-main', handleMessageFromRenderer);
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



