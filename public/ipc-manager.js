const { ipcRenderer, ipcMain } = require('electron');

// Define the IPCManager class
class IPCManager
{
    constructor()
    {
        // Initialize an empty object to store listeners
        this.listeners = {};

        // Listen for IPC requests in the main process
        ipcMain.on('ipc-request', this.handleRequest.bind(this));

        // Listen for IPC responses in the renderer process
        ipcRenderer.on('ipc-response', this.handleResponse.bind(this));
    }

    // Handler for IPC requests in the main process
    handleRequest(event, payload)
    {
        // Extract the channel and data from the payload
        const { channel, data } = payload;
        if (this.listeners[channel])
        {
            // Call the listener for the requested channel with the data and a callback function
            this.listeners[channel](data, (response) =>
            {
                // Send response back to the renderer process
                event.sender.send('ipc-response', { channel, data: response });
            });
        }
    }

    // Handler for IPC responses in the renderer process
    handleResponse(event, payload) {
        // Extract the channel and data from the payload
        const { channel, data } = payload;
        if (this.listeners[channel])
        {
            // Call the listener for the received channel with the data
            this.listeners[channel](data);
        }
    }

    // Register a listener for a specific channel
    on(channel, listener)
    {
        // If the channel doesn't exist in the listeners object, initialize it as an empty array
        if (!this.listeners[channel])
        {
            this.listeners[channel] = [];
        }
        // Add the listener to the array for the specified channel
        this.listeners[channel].push(listener);
    }

    // Unregister a listener for a specific channel
    off(channel, listener)
    {
        // Get the array of listeners for the specified channel
        const channelListeners = this.listeners[channel];
        if (!channelListeners)
        {
            // If there are no listeners for the channel, return
            return;
        }
        // Find the index of the listener in the array
        const index = channelListeners.indexOf(listener);
        if (index > -1)
        {
            // If the listener is found, remove it from the array
            channelListeners.splice(index, 1);
        }
    }

    // Send a request from the renderer process to the main process
    send(channel, data, callback)
    {
        // Send the IPC request to the main process with the channel and data
        ipcRenderer.send('ipc-request', { channel, data });

        // If a callback is provided, listen for the response and remove the listener after receiving it
        if (callback)
        {
            // Define a response listener function
            const responseListener = (response) =>
            {
                // Call the callback function with the received response
                callback(response);
                // Remove the response listener from the listeners array
                this.off(channel, responseListener);
            };
            // Register the response listener for the specified channel
            this.on(channel, responseListener);
        }
    }

    // Send a response from the main process to the renderer process
    respond(channel, data)
    {
        // Send the IPC response to the renderer process with the channel and data
        ipcRenderer.send('ipc-response', { channel, data });
    }
}

module.exports = IPCManager;
