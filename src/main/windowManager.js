const path = require('path');
const isDev = require('electron-is-dev')
const { saveWindowDimensions, loadWindowDimensions } = require('./settingsManager');
const { BrowserWindow, ipcMain } = require("electron");
const { setChildWindowIdMap } = require("./childWindowManager");
const { removeWindowFromChannel } = require('./channelManager');
const { addContextMenus } = require('./contextMenuManager');

const childWindowTitleMap = new Map();
const getChildWindowTitleMap = () => childWindowTitleMap;
const clearChildWindowTitleMap = () => childWindowTitleMap.clear();
const getChildWindowByTitle = (title) => childWindowTitleMap.get(title);

const saveChildWindowDimensions = async () =>
{
    childWindowTitleMap.forEach((childWindow) =>
    {
        if (childWindow && !childWindow.isDestroyed())
        {
            try
            {
                console.log("Saving dimensions for child window:", childWindow.getTitle());
                removeWindowFromChannel(childWindow.getTitle());
                saveWindowDimensions(childWindow).catch((err) => console.error("Error saving child window's dimensions:", err));
            }
            catch (err)
            {
                console.error("Failed to save dimensions for child window:", err);
            }
        }
    });
}

const createMainWindow = () =>
{
    const mainWindow = new BrowserWindow({
        width: 1000,
        height: 660,
        minHeight: 660,
        maxHeight: 1860,
        minWidth:400,
        title: 'Launch Pad',
        frame: false,
        webPreferences:
            {
                contextIsolation: true,
                nodeIntegration: true,
                webSecurity: false,
                enableRemoteModule: true,
                preload: path.join(__dirname, '../../public/preload.js')
            }
    });

    console.log(`Main window created with Id: ${mainWindow.id} and title: "${BrowserWindow.fromId(mainWindow.id).getTitle()}"`);

    mainWindow.removeMenu();

    mainWindow.loadURL(isDev ? 'http://localhost:3000' : `file://${path.join(__dirname, '../../build/index.html')}`)
        .catch((err) => console.error("Error loading URL in main window:", err));

    loadWindowDimensions(mainWindow)
        .then(() => console.log("Main window dimensions loaded from settings file."));

    mainWindow.on('close', () => saveWindowDimensions(mainWindow));

    const handleGetWindowIdMessage = (event, windowTitle) =>
    {
        const windowId = windowTitle + "-" + event.processId + "-" + event.sender.id;
        setChildWindowIdMap(windowId, mainWindow);
        event.returnValue = windowId;
    }

    ipcMain.on('get-window-id', (event, windowTitle) => handleGetWindowIdMessage(event, windowTitle));

    return mainWindow;
}


const createOpenAppHandler = (mainWindow) =>
{
    return (event, { url, title, modalFlag }) =>
    {
        const tit = childWindowTitleMap.has(title) ? `${title} (${childWindowTitleMap.size})` : title;
        let childWindow = new BrowserWindow({
            parent: mainWindow,
            title: tit,
            modal: modalFlag ?? false,
            show: true,
            frame: false,
            width: 800,
            height: 600,
            icon: path.join(__dirname, `../../assets/${title}.png`),
            webPreferences: {
                nodeIntegration: true,
                preload: path.join(__dirname, '../../public/preload.js')
            }
        });

        childWindow.removeMenu();
        childWindow.webContents.openDevTools(); // TODO: Remove in production
        childWindow.loadURL(url).then(() => console.log(`Child window created with Id: ${childWindow.id} and title: "${BrowserWindow.fromId(childWindow.id).getTitle()}"`));
        childWindowTitleMap.set(tit, childWindow);

        const handleGetWindowIdMessage = (event, windowTitle) => {
            const windowId = `${windowTitle}-${event.processId}-${event.sender.id}`;
            setChildWindowIdMap(windowId, childWindow);
            event.returnValue = windowId;
        };

        ipcMain.on('get-window-id', handleGetWindowIdMessage);

        childWindow.on('close', () =>
        {
            ipcMain.removeListener('get-window-id', handleGetWindowIdMessage);
            removeWindowFromChannel(tit);
            saveWindowDimensions(childWindow)
                .then(() => childWindowTitleMap.delete(tit))
                .catch(err => console.log(`Error saving child window state: ${err}`));
        });

        addContextMenus(childWindow, childWindowTitleMap, mainWindow);
        loadWindowDimensions(childWindow).then(() => console.log("Child window config complete"));
    };
};

module.exports = {
    createMainWindow,
    createOpenAppHandler,
    getChildWindowTitleMap,
    clearChildWindowTitleMap,
    saveChildWindowDimensions,
    getChildWindowByTitle
}
