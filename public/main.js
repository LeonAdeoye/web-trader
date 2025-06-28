const { setupMessageHandlers, removeAllListeners } = require('../src/main/modules/messageHandler');
const { initializeChannels } = require('../src/main/modules/channelManager');
const { readFIXATDLFiles } = require('../src/main/modules/fixatdlManager');
const { clearChildWindowIdMap } = require('../src/main/modules/childWindowManager');
const { addContextMenu } = require('../src/main/modules/contextMenuManager');
const { createMainWindow, createOpenAppHandler, getChildWindowTitleMap, clearChildWindowTitleMap, saveChildWindowDimensions} = require("../src/main/modules/windowManager");
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
    addContextMenu(mainWindow, getChildWindowTitleMap(), mainWindow);
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

