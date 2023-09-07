// Because the require function is a polyfill with limited functionality,
// you will not be able to use CommonJS modules to separate your preload script into multiple files.
// If you need to split your preload code, use a bundler such as webpack.

// Electron's main process is a Node.js environment that has full operating system access.
// On top of Electron modules, you can also access Node.js built-ins, as well as any packages installed via npm.
// On the other hand, renderer processes run web pages and do not run Node.js by default for security reasons.
// To bridge Electron's different process types together, we will need to use a special script called a preload.
// A BrowserWindow's preload script runs in a context that has access to both the HTML DOM and a limited subset of Node.js and Electron APIs.
// From Electron 20 onwards, preload scripts are sand-boxed by default and no longer have access to a full Node.js environment.
// Practically, this means that you have a poly-filled require function that only has access to a limited set of APIs.

// Although preload scripts share a window global with the renderer they're attached to,
// you cannot directly attach any variables from the preload script to window because of the contextIsolation default.
// Context Isolation means that preload scripts are isolated from the renderer's main world
// to avoid leaking any privileged APIs into your web content's code.
// Instead, use the contextBridge module to accomplish this securely:
const { contextBridge, ipcRenderer } = require('electron')

contextBridge.exposeInMainWorld('launchPad', {
    openApp: (url, title) => ipcRenderer.send('openApp', url, title)
})

contextBridge.exposeInMainWorld('messenger', {
    sendMessageToMain: (fdc3Context, destination, source) => ipcRenderer.send('message-to-main-from-renderer', fdc3Context, destination, source),
    handleMessageFromMain: (callback) => ipcRenderer.on('message-to-renderer-from-main', (_, destination, fdc3Context, source) =>
    {
        callback(destination, fdc3Context, source);
    })
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
})
