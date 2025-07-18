const {ipcMain, BrowserWindow} = require('electron');
const { getAllFIXATDLContent } = require("./fixatdlManager");
const { getChildWindowById, setChildWindowIdMap} = require('./childWindowManager');
const { handleFDC3Message } = require('./fdc3Manager');

let loggedInUser;

const handleSetLoggedInUserMessage = (_, userId) => {
    loggedInUser = userId;
};

const handleGetLoggedInUserMessage = () => {
    return loggedInUser;
};

const handleCloseMessage = (_, windowId) => {
    getChildWindowById(windowId).close();
};

const handleMinimizeMessage = (_, windowId) => {
    getChildWindowById(windowId).minimize();
};

const handleMaximizeMessage = (_, windowId) => {
    getChildWindowById(windowId).maximize();
};

const handleOpenToolsMessage = (_, windowId) =>
{
    // TODO
}

const handleOpenChannelsMessage = (_, windowId) =>
{
    // TODO
}

const handleMessageFromRenderer = (_, fdc3Message, destination, source) => {
    handleFDC3Message(fdc3Message, destination, source);
};

const handleGetChildWindowIdMessage = (event) =>
{
    const requestingWebContents = event.sender;
    const browserWindow = BrowserWindow.fromWebContents(requestingWebContents);

    if (browserWindow)
    {
        const windowId = browserWindow.id;
        setChildWindowIdMap(windowId, browserWindow);
        event.returnValue = windowId;
    }
    else
    {
        console.error("Could not resolve window from event.sender");
        event.returnValue = null;
    }
}

const setupMessageHandlers = async () =>
{
    console.log("Setting up message handlers for IPC events.")
    ipcMain.on('get-child-window-id', handleGetChildWindowIdMessage);
    ipcMain.on('message-to-main-from-renderer', handleMessageFromRenderer);
    ipcMain.on('set-user-logged-in', handleSetLoggedInUserMessage);
    ipcMain.on('close', handleCloseMessage);
    ipcMain.on('maximize', handleMaximizeMessage);
    ipcMain.on('minimize', handleMinimizeMessage);
    ipcMain.handle('get-user-logged-in', handleGetLoggedInUserMessage);
    ipcMain.handle("get-strategy-xml", getAllFIXATDLContent);
    ipcMain.on('open-tools', handleOpenToolsMessage);
    ipcMain.on('open-channel', handleOpenChannelsMessage);
};

const removeAllListeners = async () =>
{
    console.log("Removing all listeners for events.");
    ipcMain.removeListener('get-child-window-id', handleGetChildWindowIdMessage);
    ipcMain.removeListener('message-to-main-from-renderer', handleMessageFromRenderer);
    ipcMain.removeListener('set-user-logged-in', handleSetLoggedInUserMessage);
    ipcMain.removeListener('get-user-logged-in', handleGetLoggedInUserMessage);
    ipcMain.removeListener('close', handleCloseMessage);
    ipcMain.removeListener('maximize', handleMaximizeMessage);
    ipcMain.removeListener('minimize', handleMinimizeMessage);
    ipcMain.removeListener('open-tools', handleOpenToolsMessage);
    ipcMain.removeListener('open-channel', handleOpenChannelsMessage);
};

module.exports = {
    setupMessageHandlers,
    removeAllListeners
}; 
