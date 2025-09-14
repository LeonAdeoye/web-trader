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

export const onAmpsTaskMessage = (message) =>
{
    switch (message.header.command())
    {
        case 'sow':
            postMessage({messageType: "snapshot", task: message.data});
            break;
        case 'p':
            postMessage({messageType: "update", task: message.data});
            break;
        default:
            break;
    }
}

export const onAmpsAlertMessage = (message) =>
{
    switch (message.header.command())
    {
        case 'sow':
            postMessage({messageType: "snapshot", alert: message.data});
            break;
        case 'p':
            postMessage({messageType: "update", alert: message.data});
            break;
        default:
            break;
    }
}

export const onAmpsCrossMessage = (message) =>
{
    switch (message.header.command())
    {
        case 'sow':
            postMessage({messageType: "snapshot", cross: message.data});
            break;
        case 'p':
            postMessage({messageType: "update", cross: message.data});
            break;
        default:
            break;
    }
}

export const onAmpsOrderMessage = (message) =>
{
    switch (message.header.command())
    {
        case 'sow':
            postMessage({messageType: "snapshot", order: message.data});
            break;
        case 'p':
            postMessage({messageType: "update", order: message.data});
            break;
        default:
            break;
    }
}

export const onAmpsMarketDataMessage = (message) =>
{
    switch (message.header.command())
    {
        case 'sow':
            postMessage({messageType: "snapshot", marketData: message.data});
            break;
        case 'p':
            postMessage({messageType: "update", marketData: message.data});
            break;
        default:
            break;
    }
}

export const onAmpsCryptoPriceMessage = (message) =>
{
    if (!message)
    {
        console.error("Invalid message received:", message);
        return;
    }

    // Handle control messages that don't contain data
    if (message.c === 'group_begin' || message.c === 'group_end')
    {
        return;
    }

    if (!message.data)
    {
        console.error("Invalid message received:", message);
        return;
    }

    // Handle different possible timestamp field names
    const timestamp = message.data.timestamp || message.data.time_stamp || new Date().toISOString();
    const dateTime = new Date(timestamp);
    
    // Ensure we have a valid timestamp
    if (isNaN(dateTime.getTime()))
    {
        console.error("Invalid timestamp in message:", timestamp);
        return;
    }
    
    switch (message.header.command())
    {
        case 'sow':
            postMessage({messageType: "snapshot", cryptoPrice: {...message.data, timestamp: dateTime}});
            break;
        case 'p':
            postMessage({messageType: "update", cryptoPrice: {...message.data, timestamp: dateTime}});
            break;
        default:
            break;
    }
}