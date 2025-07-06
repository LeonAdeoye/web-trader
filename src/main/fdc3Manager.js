const { clipboard } = require('electron');
const { getChildWindowById } = require('./childWindowManager');
const { getChannelWindowMap } = require('./channelManager');
const { getChildWindowTitleMap, getChildWindowByTitle } = require('./windowManager');
const { setSelectedOrder, setSelectedOrders} = require('./orderSelectionManager');
const {addContextMenus} = require("./contextMenuManager");

const handleFDC3Message = (fdc3Message, destination, source) => {
    console.log("Received FDC3 message from child window:", source, "with context:", fdc3Message);

    switch (fdc3Message.type)
    {
        case "fdc3.context":
            const sourceTitle = getChildWindowById(source)?.getTitle();
            if (!sourceTitle) break;

            getChannelWindowMap().forEach((titles, channel) =>
            {
                if (titles.includes(sourceTitle))
                {
                    titles.filter(t => t !== sourceTitle).forEach(destTitle =>
                    {
                        const destWindow = getChildWindowTitleMap().get(destTitle);
                        destWindow?.webContents.send("message-to-renderer-from-main", fdc3Message, `${channel} channel`, sourceTitle);
                        console.log(`Context sent to ${destWindow?.getTitle()} on ${channel} channel.`);
                    });
                }
            });
            break;
        case "fdc3.chart":
            const regex = new RegExp(destination + "( \\(\\d+\\))?");
            getChildWindowTitleMap().forEach(win =>
            {
                if (regex.test(win.getTitle()))
                {
                    win.webContents.send("message-to-renderer-from-main", fdc3Message, destination, source);
                    console.log("Chart context sent to:", win.getTitle());
                }
            });
            break;

        case "fdc3.orderContextMenu":
            if(fdc3Message.orders && fdc3Message.orders.length === 1)
                setSelectedOrder(fdc3Message.orders[0]);
            else if(fdc3Message.orders && fdc3Message.orders.length > 1)
                setSelectedOrders(fdc3Message.orders);
            addContextMenus(getChildWindowByTitle(source), getChildWindowTitleMap(), null);
            break;
        case "fdc3.clipboard":
            clipboard.writeText(fdc3Message.payload);
            console.log("Clipboard payload written.");
            break;

        default:
            console.log("Unsupported FDC3 message type:", fdc3Message.type);
    }
};

module.exports = {
    handleFDC3Message
};
