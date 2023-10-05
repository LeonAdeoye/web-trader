const { app, BrowserWindow, ipcMain, Menu, clipboard } = require('electron');
const isDev = require('electron-is-dev')
const path = require('path');
const settings = require("electron-settings");

require('@electron/remote/main').initialize();

process.env['ELECTRON_DISABLE_SECURITY_WARNINGS'] = 'true';

let mainWindow;
// Used to capture the logged-in user from the login dialog and make it available to the rest of the app.
let loggedInUser;

// Create map of child window objects keyed by their window titles. This is used for managing duplicate titles of newly created child windows of the same type.
const childWindowTitleMap = new Map();
// Create map of child window objects keyed by their window IDs. This is used for context sharing.
const childWindowIdMap = new Map();
// Create map of window titles keyed by channel name.
const channelsWindowMap = new Map();

channelsWindowMap.set('red', []);
channelsWindowMap.set('blue', []);
channelsWindowMap.set('green', []);
channelsWindowMap.set('yellow', []);

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
    //mainWindow.webContents.openDevTools();

    // Each instance of the BrowserWindow class creates an application window that loads a web page in a separate renderer process.
    // You can interact with this web content from the main process using the window's webContents object.
    mainWindow.loadURL(isDev ? 'http://localhost:3000' : `file://${path.join(__dirname, '../build/index.html')}`);
    loadWindowDimensions(mainWindow)
        .then(() => console.log("Main window dimensions loaded from settings file."));

    mainWindow.on('close', () => saveWindowDimensions(mainWindow));
}

const handleOpenAppMessage = (event, {url, title}) =>
{
    let childWindow = new BrowserWindow({
        parent: mainWindow,
        title: childWindowTitleMap.has(title) ? `${title} (${childWindowTitleMap.size})` : title,
        modal: false,
        show: true,
        frame: true,
        width: 800,
        height: 600,
        icon: path.join(__dirname, `../assets/${title}.png`),
        webPreferences: {nodeIntegration: true, preload: path.join(__dirname, 'preload.js')}
    });

    childWindow.removeMenu();
    childWindow.webContents.openDevTools(); // TODO: Remove this line in production
    childWindow.loadURL(url).then(() => console.log("Child window created with title: " + childWindow.getTitle()));
    childWindowTitleMap.set(childWindow.getTitle(), childWindow);


    clipboard.writeText('Leon Adeoye');

    childWindow.on('close', () =>
    {
        let title = childWindow.getTitle();
        ipcMain.removeListener('get-window-id', handleGetWindowIdMessage);
        removeWindowFromChannel(title);
        saveWindowDimensions(childWindow)
            .then(() => childWindowTitleMap.delete(title))
            .catch((err) => console.log(`Error saving child window position and size because of ${err}`));
    });

    // This is the legacy approach before the ipcRenderer invoke method was introduced.
    // It is still used here because of the childWindow closure will not be available to the ipcMain event handler.
    const handleGetWindowIdMessage = (event, windowTitle) =>
    {
        const windowId = windowTitle + "-" + event.processId + "-" + event.sender.id;
        childWindowIdMap.set(windowId, childWindow);
        event.returnValue = windowId;
    }

    ipcMain.on('get-window-id', (event, windowTitle) => handleGetWindowIdMessage(event, windowTitle));

    addContextMenu(childWindow);
    loadWindowDimensions(childWindow).then(() => console.log("Child window configuration completed"));
}

const saveWindowDimensions = async (window) =>
{
    const [x, y] = window.getPosition();
    const [w, h] = window.getSize();
    const title = window.getTitle();

    await settings.set(title, {x: x, y: y, h: h, w: w})
        .then(() => console.log(`Saving last window position and size of ${title} app: (${x},${y}) (${w},${h})`))
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
            { label: 'Context Sharing Channel', submenu: [
                    { label: 'Set channel to red', icon: path.join(__dirname, '../assets', 'red.png'), click: () => addWindowToChannel('red', window.getTitle()) },
                    { type: 'separator' },
                    { label: 'Set channel to blue', icon: path.join(__dirname, '../assets', 'blue.png'), click: () => addWindowToChannel('blue', window.getTitle()) },
                    { type: 'separator' },
                    { label: 'Set channel to green', icon: path.join(__dirname, '../assets', 'green.png'), click: () => addWindowToChannel('green', window.getTitle()) },
                    { type: 'separator' },
                    { label: 'Set channel to yellow', icon: path.join(__dirname, '../assets', 'yellow.png'), click: () => addWindowToChannel('yellow', window.getTitle()) },
                    { type: 'separator' },
                    { label: 'No channel selected', click: () => removeWindowFromChannel(window.getTitle()) }
                ]},
            { type: 'separator' },
            { label: 'Close current window', click: () => saveWindowDimensions(window).then(() => window.close()) },
            { type: 'separator' },
            { label: 'Quit application', click: () => saveWindowDimensions(mainWindow).then(() =>
                {
                    childWindowTitleMap.forEach((childWindow) =>
                    {
                        removeWindowFromChannel(childWindow.getTitle());
                        saveWindowDimensions(childWindow);
                    });
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

const addWindowToChannel = (channel, windowTitle) =>
{
    channelsWindowMap.get(channel).push(windowTitle);
    console.log("Added window: " + windowTitle + " to " + channel + " channel. Current window(s) in " + channel + " channel: [" + channelsWindowMap.get(channel) + "]");
}

const removeWindowFromChannel = (windowTitle) =>
{
    channelsWindowMap.forEach((value) =>
    {
        const index = value.indexOf(windowTitle);
        if(index > -1)
        {
            console.log("Removing window: " + windowTitle + " from all channels");
            value.splice(index, 1);
        }
    });
    channelsWindowMap.forEach((value, key) => value.length > 0 && console.log("Window(s) remaining in " + key + " channel: " + value));
}

const handleMessageFromRenderer = (_, fdc3Message, destination, source) =>
{
    console.log("Received message from child window: " + source + " with context: " + JSON.stringify(fdc3Message) + (destination ? ` to be sent to destination child window(s): ${destination}` : ""));
    switch (fdc3Message.type)
    {
        case "fdc3.instrument":
            const sourceChildWindowTitle = childWindowIdMap.get(source).getTitle();
            channelsWindowMap.forEach((value, key) =>
            {
                if(value.includes(sourceChildWindowTitle))
                {
                    const sourceIndexToExclude = value.indexOf(sourceChildWindowTitle);
                    value.filter((element, index) => index !== sourceIndexToExclude).forEach((destinationWindowTitle) =>
                    {
                        const destinationChildWindow = childWindowTitleMap.get(destinationWindowTitle);
                        destinationChildWindow.webContents.send("message-to-renderer-from-main", fdc3Message, key + " channel", sourceChildWindowTitle);
                        console.log("Message sent to child window: " + destinationChildWindow.getTitle() + " with context: " + JSON.stringify(fdc3Message));
                    });
                }
            });
            break;
        case "fdc3.chart":
            const regex = new RegExp(destination + "( \\(\\d+\\))?");
            childWindowTitleMap.forEach((childWindow) =>
            {
                if(regex.test(childWindow.getTitle()))
                {
                    childWindow.webContents.send("message-to-renderer-from-main", fdc3Message, destination, source);
                    console.log("Message sent to child window: " + childWindow.getTitle() + " with context: " + JSON.stringify(fdc3Message));
                }
            });
            break;
        case "fdc3.clipboard":
            clipboard.writeText(fdc3Message.payload);
            break;
        default:
            console.log("Message type not supported: " + fdc3Message.type);
    }
}

const handleSetLoggedInUserMessage = (_, userId) => loggedInUser = userId;
const handleGetLoggedInUserMessage = () => loggedInUser;
const handleCloseMessage = (_, windowTitle) => {};
const handleMinimizeMessage = (_, windowTitle) => {};
const handleMaximizeMessage = (_, windowTitle) => {};
const handleOpenToolsMessage = (_, windowTitle) => {};
const handleOpenChannelsMessage = (_, windowTitle) => {};

app.whenReady().then(() =>
{
    ipcMain.on('openApp', handleOpenAppMessage);
    ipcMain.on('message-to-main-from-renderer', handleMessageFromRenderer);
    ipcMain.on('set-user-logged-in', handleSetLoggedInUserMessage);
    ipcMain.handle('get-user-logged-in', handleGetLoggedInUserMessage);

    ipcMain.on('close', handleCloseMessage);
    ipcMain.on('maximize', handleMaximizeMessage);
    ipcMain.on('minimize', handleMinimizeMessage);
    ipcMain.on('open-tools', handleOpenToolsMessage);
    ipcMain.on('open-channel', handleOpenChannelsMessage);

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
    ipcMain.removeListener('openApp', handleOpenAppMessage);
    ipcMain.removeListener('message-to-main-from-renderer', handleMessageFromRenderer);

    ipcMain.removeListener('set-user-logged-in', handleSetLoggedInUserMessage);
    ipcMain.removeListener('get-user-logged-in', handleGetLoggedInUserMessage);

    ipcMain.removeListener('close', handleCloseMessage);
    ipcMain.removeListener('maximize', handleMaximizeMessage);
    ipcMain.removeListener('minimize', handleMinimizeMessage);
    ipcMain.removeListener('open-tools', handleOpenToolsMessage);
    ipcMain.removeListener('open-channel', handleOpenChannelsMessage);

    childWindowTitleMap.forEach((childWindow) =>
    {
        if(childWindow !== undefined)
        {
            removeWindowFromChannel(childWindow.getTitle());
            saveWindowDimensions(childWindow)
                .catch((err) => console.log("Error saving child window's dimensions: " + err));
        }
    });

    childWindowTitleMap.clear();
    childWindowIdMap.clear();
});



