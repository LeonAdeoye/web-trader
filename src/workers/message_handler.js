export const onAmpsPriceMessage = (message) =>
{
    const dateTime = new Date(message.data.time_stamp);
    switch (message.header.command())
    {
        case 'sow':
            postMessage({messageType: "snapshot", price: {...message.data, time_stamp: dateTime}});
            break;
        case 'p':
            postMessage({messageType: "update", price: {...message.data, time_stamp: dateTime}});
            break;
        default:
            break;
    }
}

export const onAmpsFxRateMessage = (message) =>
{
    switch (message.header.command())
    {
        case 'sow':
            postMessage({messageType: "snapshot", rate: message.data});
            break;
        case 'p':
            postMessage({messageType: "update", rate: message.data});
            break;
        default:
            break;
    }
}
