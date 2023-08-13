export const timestampToHHMMSS = (timestamp) =>
{
    const date = new Date(timestamp);
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    const seconds = date.getSeconds().toString().padStart(2, '0');
    return `${hours}:${minutes}:${seconds}`;
}

export const onAmpsMessage = (message) =>
{
    const dateTime = timestampToHHMMSS(message.data.timestamp);
    switch (message.header.command())
    {
        case 'sow':
            postMessage({messageType: "snapshot", price: {...message.data, time: dateTime}});
            break;
        case 'p':
            postMessage({messageType: "update", price: {...message.data, time: dateTime}});
            break;
        default:
            break;
    }
}
