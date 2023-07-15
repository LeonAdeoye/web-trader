const {Client, Command} = require('amps');

let count = 0

async function main()
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
        console.log(e);
    }
}

const onAmpsMessage = (message) =>
{
    const sow = [];
    switch (message.header.command())
    {
        case 'sow':
            postMessage({ messageType: "snapshot" , price: message.data});
            break;
        case 'p':
            postMessage({ messageType: "update", price: message.data});
            break;
        case 'group_begin':
            break;
        case 'group_end':
            break;
        default:
            break;
    }
}



main().then(() => console.log("AMPS subscription completed."));

