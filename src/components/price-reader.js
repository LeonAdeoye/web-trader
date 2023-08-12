const {Client, Command} = require('amps');

onConnect = (event) => {
    const port = event.ports[0];
}

const main = async () =>
{
    try
    {
        const clientName = "web-trader-price-reader";
        const topicName = "prices";
        const url = "ws://localhost:9008/amps/json";
        const client = new Client(clientName);
        await client.connect(url);
        const cmd = new Command("sow_and_delta_subscribe").topic(topicName);
        await client.execute(cmd, onAmpsMessage);
        console.log("Connected to AMPS using URL: ", url);
    }
    catch (e)
    {
        console.error(e);
    }
}

const timestampToHHMMSS = (timestamp) =>
{
    const date = new Date(timestamp);
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    const seconds = date.getSeconds().toString().padStart(2, '0');
    return `${hours}:${minutes}:${seconds}`;
}

const onAmpsMessage = (message) =>
{
    const timeHHMMSS = timestampToHHMMSS(message.data.timestamp);
    switch (message.header.command())
    {
        case 'sow':
            postMessage({ messageType: "snapshot" , price: {...message.data, time: timeHHMMSS}});
            break;
        case 'p':
            postMessage({ messageType: "update", price: {...message.data, time: timeHHMMSS}});
            break;
        default:
            break;
    }
}

main().then(() => console.log("AMPS subscription completed."));

