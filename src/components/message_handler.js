export const onAmpsMessage = (message) =>
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
