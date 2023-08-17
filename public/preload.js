// Electron's main process is a Node.js environment that has full operating system access.
// On top of Electron modules, you can also access Node.js built-ins, as well as any packages installed via npm.
// On the other hand, renderer processes run web pages and do not run Node.js by default for security reasons.
// To bridge Electron's different process types together, we will need to use a special script called a preload.
// A BrowserWindow's preload script runs in a context that has access to both the HTML DOM and a limited subset of Node.js and Electron APIs.
// From Electron 20 onwards, preload scripts are sand-boxed by default and no longer have access to a full Node.js environment.
// Practically, this means that you have a poly-filled require function that only has access to a limited set of APIs.

// Created a preload script that exposes my app's versions of Chrome, Node, and Electron into the renderer.
// The script that exposes selected properties of Electron's process.versions object to the renderer process in a versions global variable.
const { contextBridge, ipcRenderer } = require('electron')

contextBridge.exposeInMainWorld('versions', {
    node: () => process.versions.node,
    chrome: () => process.versions.chrome,
    electron: () => process.versions.electron,
    // It is not possible to access the Node.js APIs directly from the renderer process, nor the HTML Document Object Model (DOM) from the main process.
    // The solution for this problem is to use Electron's ipcMain and ipcRenderer modules for inter-process communication (IPC).
    // To send a message from your web page to the main process, you can set up a main process handler with ipcMain.handle
    // and then expose a function like logVersions below in your preload script that calls ipcRenderer.invoke to trigger the handler in your main.js script.
    logVersions: () => ipcRenderer.invoke('logVersions')
    // we can also expose variables, not just functions
})

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
