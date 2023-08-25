const { app, BrowserWindow, ipcMain, Menu } = require('electron');
const isDev = require('electron-is-dev')
const path = require('path');
const settings = require("electron-settings");

require('@electron/remote/main').initialize();

process.env['ELECTRON_DISABLE_SECURITY_WARNINGS'] = 'true';

let mainWindow;

// create amp of child windows objects keyed by destination IDs
const childWindowsMap = new Map();

settings.configure({
    atomicSave: true,
    fileName: 'settings.json',
    numSpaces: 2,
    prettify: false
});

console.log("settings file path: " + settings.file());

// The main process' primary purpose is to create and manage application windows with the BrowserWindow module.
const createWindow = () =>
{
    mainWindow = new BrowserWindow({
        width: 1000,
        height: 660,
        minHeight: 660,
        maxHeight: 1860,
        minWidth:400,
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
    loadWindowDimensions(mainWindow)
        .then(() => console.log("Main window dimensions loaded from settings file."))
    mainWindow.on('close', () => saveWindowDimensions(mainWindow));
}

const openApp = (event, {url, title}) =>
{
    const childWindow = new BrowserWindow({
        parent: mainWindow,
        title: childWindowsMap.has(title) ? `${title} (${childWindowsMap.size})` : title,
        modal: false,
        show: true,
        frame: true,
        width: 800,
        height: 600,
        icon: path.join(__dirname, `../assets/${title}.png`),
        webPreferences: { nodeIntegration: true, preload: path.join(__dirname, 'preload.js') }
    });

    childWindow.removeMenu();
    childWindow.webContents.openDevTools();
    childWindow.loadURL(url).then(() => console.log("Child window created with title: " + childWindow.getTitle()));
    childWindowsMap.set(childWindow.getTitle(), childWindow);

    childWindow.on('close', () =>
    {
        saveWindowDimensions(childWindow). then(() => childWindowsMap.delete(childWindow.getTitle()));
    });

    addContextMenu(childWindow);
    loadWindowDimensions(childWindow).then(() => console.log("Child window configuration completed"));
}

const saveWindowDimensions = async (window) =>
{
    const [x, y] = window.getPosition();
    const [w, h] = window.getSize();
    await settings.set(window.getTitle(), {x: x, y: y, h: h, w: w})
        .then(() => console.log(`Saving last window position and size of: ${window.getTitle()}: (${x},${y}) (${w},${h})`))
        .catch((err) => console.log(`Error saving child window position and size because of ${err}`));
}

const loadWindowDimensions = async (window) =>
{
    await settings.get(window.getTitle())
        .then((dimensions) =>
        {
            if(dimensions === undefined)
                return;

            const {x ,y , h, w} = dimensions;

            if(x !== undefined && y !== undefined)
                window.setPosition(x, y);

            if(w !== undefined && h !== undefined)
                window.setSize(w, h);
        })
        .catch((err) => console.log("Error loading window position: " + err));
}

const addContextMenu = (window) =>
{
    const contextMenuTemplate =
        [
            { label: 'Impersonate', click: () => console.log('Impersonate clicked') },
            { type: 'separator' },
            { label: 'Workspaces', submenu: [
                    { label: 'Low-touch Trading', click: () => console.log('Low-touch Trading clicked') },
                    { type: 'separator' },
                    { label: 'High-touch Trading', click: () => console.log('High-touch Trading clicked') },
                    { type: 'separator' },
                    { label: 'Program Trading', click: () => console.log('Program Trading clicked') },
                    { type: 'separator' },
                    { label: 'Create Workspace', click: () => console.log('New Workspace clicked') }
            ]},
            { type: 'separator' },
            { label: 'Close current window', click: () => saveWindowDimensions(window).then(() => window.close()) },
            { type: 'separator' },
            { label: 'Quit application', click: () => saveWindowDimensions(mainWindow).then(() =>
                {
                    childWindowsMap.forEach((childWindow) => saveWindowDimensions(childWindow));
                    app.quit();
                })
            }
        ];

    const contextMenu = Menu.buildFromTemplate(contextMenuTemplate);

    window.webContents.on('context-menu', (event, params) =>
    {
        contextMenu.popup({ window: window, x: params.x, y: params.y });
    });
}

const handleMessageFromRenderer = (_, fdc3Context, destination, source) =>
{
    // To send a message from main.js to a renderer process, use the webContents.send method on the target child window's webContents.
    // The webContents.send method takes a channel name and a data payload as arguments.
    // Iterate through each item in childWindowsMap and send a message to each child window that starts with the destination text value and optionally ends with a non-zero integer in brackets.
    const regex = new RegExp(destination + "( \\(\\d+\\))?");
    childWindowsMap.forEach((childWindow) =>
    {
        if(regex.test(childWindow.getTitle()))
        {
            childWindow.webContents.send("message-to-renderer", destination, fdc3Context, source);
            console.log("Message sent to child window: " + childWindow.getTitle() + " with context: " + JSON.stringify(fdc3Context));
        }
    });
}

app.whenReady().then(() =>
{
    ipcMain.on('openApp', openApp);
    ipcMain.on('message-to-main', handleMessageFromRenderer);
    createWindow();
    addContextMenu(mainWindow);
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

app.on('before-quit', () =>
{
    ipcMain.removeListener('openApp', openApp);
    ipcMain.removeListener('message-to-main', handleMessageFromRenderer);
    childWindowsMap.forEach((childWindow) =>
    {
        if(childWindow !== undefined)
            saveWindowDimensions(childWindow)
                .catch((err) => console.log("Error saving child window dimensions: " + err));
    });
    childWindowsMap.clear();
});



