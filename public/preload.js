const { contextBridge, ipcRenderer } = require('electron')
const { fs } = require('fs');

contextBridge.exposeInMainWorld('launchPad', {
    openApp: (url, title, modalFlag) => ipcRenderer.send('openApp', url, title, modalFlag)
});

contextBridge.exposeInMainWorld('command', {
    close: (windowTitle) => ipcRenderer.send('close', windowTitle),
    maximize: (windowTitle) => ipcRenderer.send('maximize', windowTitle),
    minimize: (windowTitle) => ipcRenderer.send('minimize', windowTitle),
    openChannels: () => ipcRenderer.send('open-channels'),
    setChannel: (windowTitle, channel) => ipcRenderer.send('open-channels', windowTitle, channel),
    openTools: () => ipcRenderer.send('open-tools'),
    getWindowId: (windowTitle) => ipcRenderer.sendSync('get-child-window-id', windowTitle),
    getMainWindowId: (windowTitle) => ipcRenderer.sendSync('get-main-window-id', windowTitle)

});

contextBridge.exposeInMainWorld('messenger', {
    sendMessageToMain: (fdc3Message, destination, source) => ipcRenderer.send('message-to-main-from-renderer', fdc3Message, destination, source),
    handleMessageFromMain: (callback) => ipcRenderer.on('message-to-renderer-from-main', (_, fdc3Message, destination, source) => callback(fdc3Message, destination, source)),
    removeHandlerForMessageFromMain: () => ipcRenderer.removeAllListeners('message-to-renderer-from-main')
});

contextBridge.exposeInMainWorld('configurations', {
    setLoggedInUserId: (loggedInUserId) => ipcRenderer.send('set-user-logged-in', loggedInUserId),
    getLoggedInUserId: () => ipcRenderer.invoke('get-user-logged-in') // This get data from main and returns it back to the render in the same call.
});

// The below code accesses the Node.js process.versions object and runs a basic replaceText helper function to insert the version numbers into the HTML document.
window.addEventListener('DOMContentLoaded', () =>
{
    const replaceText = (selector, text) =>
    {
        const element = document.getElementById(selector)
        if (element) element.innerText = text
    }

    for (const dependency of ['chrome', 'node', 'electron'])
    {
        replaceText(`${dependency}-version`, process.versions[dependency])
    }
});

contextBridge.exposeInMainWorld("strategyLoader", {
    getStrategyXML: () => ipcRenderer.invoke("get-strategy-xml")
});

