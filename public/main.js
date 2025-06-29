const { setupMessageHandlers, removeAllListeners } = require('../src/main/messageHandler');
const { initializeChannels } = require('../src/main/channelManager');
const { readFIXATDLFiles } = require('../src/main/fixatdlManager');
const { clearChildWindowIdMap } = require('../src/main/childWindowManager');
const { addContextMenus } = require('../src/main/contextMenuManager');
const { createMainWindow, createOpenAppHandler, getChildWindowTitleMap, clearChildWindowTitleMap, saveChildWindowDimensions} = require("../src/main/windowManager");
const { app, BrowserWindow, ipcMain } = require('electron');

require('@electron/remote/main').initialize();
process.env['ELECTRON_DISABLE_SECURITY_WARNINGS'] = 'true';
let mainWindow;

app.whenReady().then(async () =>
{
    await readFIXATDLFiles();
    await setupMessageHandlers();
    initializeChannels();
    mainWindow = createMainWindow();
    const openAppHandler = createOpenAppHandler(mainWindow);
    ipcMain.on('openApp', openAppHandler);
    addContextMenus(mainWindow, getChildWindowTitleMap(), mainWindow);
});

app.on('window-all-closed', () =>
{
    if (process.platform !== 'darwin')
        app.quit();
});

app.on('activate', () =>
{
    if (BrowserWindow.getAllWindows().length === 0)
        mainWindow = createMainWindow();
});

app.on('before-quit', async () =>
{
    await removeAllListeners();
    await saveChildWindowDimensions();
    clearChildWindowTitleMap();
    clearChildWindowIdMap()
});

