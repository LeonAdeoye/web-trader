const path = require('path');
const { addWindowToChannel, removeWindowFromChannel } = require('./channelManager');
const { saveWindowDimensions } = require('./settingsManager');
const { getSelectedOrders } = require('./orderSelectionManager');
const {app, Menu} = require('electron');

const getOrdersAppContextMenuOptions = (window) =>
{
    const dynamicContextMenuItems = [];
    const selectedOrders = getSelectedOrders();
    console.log("Selected orders for context menu generation: ", JSON.stringify(selectedOrders));
    const uniqueStates = [...new Set(selectedOrders.map(order => order.orderState))];

    if (uniqueStates.length === 1)
    {
        const state = uniqueStates[0];
        const orderIds = selectedOrders.map(order => order.orderId);

        switch (state)
        {
            case 'PENDING_NEW':
                dynamicContextMenuItems.push(
                { label: '✅ Accept', click: () => orderIds.forEach(orderId => window.webContents.send('message-to-renderer-from-main', {type: 'order-action', action: 'accept', orderId: orderId}, window.getTitle(), 'main'))},
                { type: 'separator' },
                { label: '❌ Reject', click: () => orderIds.forEach(orderId => window.webContents.send('message-to-renderer-from-main', {type: 'order-action', action: 'reject', orderId: orderId}, window.getTitle(), 'main'))},
                { type: 'separator' });
                break;

            case 'ACCEPTED_BY_OMS':
            case 'ACCEPTED_BY_DESK':
                dynamicContextMenuItems.push(
                { label: '❌ Cancel', click: () => orderIds.forEach(orderId => window.webContents.send('message-to-renderer-from-main', {type: 'order-action', action: 'cancel', orderId: orderId}, window.getTitle(), 'main'))},
                { type: 'separator' },
                { label: '✂ Slice', click: () => orderIds.forEach(orderId => window.webContents.send('message-to-renderer-from-main', {type: 'order-action', action: 'slice', orderId: orderId}, window.getTitle(), 'main'))},
                { type: 'separator' },
                { label: '📤 Send All', click: () => orderIds.forEach(orderId => window.webContents.send('message-to-renderer-from-main', {type: 'order-action', action: 'sendAll', orderId: orderId}, window.getTitle(), 'main'))},
                { type: 'separator' });
                break;
            default:
                console.log("No specific actions available for the current order state: " + state);
        }
    }

    return dynamicContextMenuItems;
};

const addContextMenus = (window, childWindowTitleMap, mainWindow) =>
{
    if (window?.webContents)
    {
        console.log("Creating context menus for window: " + window.getTitle() + " with Id: " + window.id);
    }
    else
    {
        console.error("Invalid window object passed to addContextMenus.");
        return;
    }

    const isMainWindow = window === mainWindow;

    const contextMenuTemplate =
        [
            ...(window.getTitle().startsWith('Orders') ? getOrdersAppContextMenuOptions(window) : []),
            ...(isMainWindow ? [
                { label: 'Impersonate', click: () => console.log('Impersonate clicked') },
                { type: 'separator' },
                {
                    label: 'Workspaces',
                    submenu: [
                        { label: 'Low-touch Trading', click: () => console.log('Low-touch Trading clicked') },
                        { type: 'separator' },
                        { label: 'High-touch Trading', click: () => console.log('High-touch Trading clicked') },
                        { type: 'separator' },
                        { label: 'Program Trading', click: () => console.log('Program Trading clicked') },
                        { type: 'separator' },
                        { label: 'Create Workspace', click: () => console.log('New Workspace clicked') },
                    ]
                },
                { type: 'separator' }
            ] : []),
            { label: 'Context Sharing Channel', submenu: [
                    { label: 'Set channel to red', icon: path.join(__dirname, '../../assets', 'red.png'), click: () =>
                        {
                            removeWindowFromChannel(window.getTitle());
                            addWindowToChannel('red', window.getTitle());
                            window.webContents.send("message-to-renderer-from-main", {type: "fdc3.context", contextShareColour: "red"}, window.getTitle(), "main");
                        }
                    },
                    { type: 'separator' },
                    { label: 'Set channel to blue', icon: path.join(__dirname, '../../assets', 'blue.png'), click: () =>
                        {
                            removeWindowFromChannel(window.getTitle());
                            addWindowToChannel('blue', window.getTitle());
                            window.webContents.send("message-to-renderer-from-main", {type: "fdc3.context", contextShareColour: "blue"}, window.getTitle(), "main");
                        }
                    },
                    { type: 'separator' },
                    { label: 'Set channel to green', icon: path.join(__dirname, '../../assets', 'green.png'), click: () =>
                        {
                            removeWindowFromChannel(window.getTitle());
                            addWindowToChannel('green', window.getTitle());
                            window.webContents.send("message-to-renderer-from-main", {type: "fdc3.context", contextShareColour: "green"}, window.getTitle(), "main");
                        }
                    },
                    { type: 'separator' },
                    { label: 'Set channel to yellow', icon: path.join(__dirname, '../../assets', 'yellow.png'), click: () =>
                        {
                            removeWindowFromChannel(window.getTitle());
                            addWindowToChannel('yellow', window.getTitle());
                            window.webContents.send("message-to-renderer-from-main", {type: "fdc3.context", contextShareColour: "yellow"}, window.getTitle(), "main");
                        }
                    },
                    { type: 'separator' },
                    { label: 'No channel selected', click: () =>
                        {
                            removeWindowFromChannel(window.getTitle());
                            window.webContents.send("message-to-renderer-from-main", {type: "fdc3.context", contextShareColour: "white"}, window.getTitle(), "main");
                        }
                    }
                ]},
            { type: 'separator' },
            { label: 'Close current window', click: () => saveWindowDimensions(window).then(() => window.close()) },
            { type: 'separator' },
            { label: 'Quit application', click: () => saveWindowDimensions(mainWindow).then(() =>
                {
                    childWindowTitleMap.forEach((childWindow) =>
                    {
                        removeWindowFromChannel(childWindow.getTitle());
                        saveWindowDimensions(childWindow).catch((err) => console.log("Error saving child window's dimensions: " + err));
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

module.exports = {
    addContextMenus
}
