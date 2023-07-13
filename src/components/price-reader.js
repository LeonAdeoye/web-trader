const {Client, Command} = require('amps');
//const config = require('config');
//let clientName = config.get('price-reader.amps-client-name');
//let topic = config.get('price-reader.amps-topic');

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

const sleep = ms => new Promise(r => setTimeout(r, ms));
const onAmpsMessage = (message) =>
{
    switch (message.header.command())
    {
        case 'group_begin':
            console.log('--- Begin SOW Results ---');
            break;
        case 'sow':
            console.log('--- SOW ---'  + JSON.stringify(message.data));
            sleep(20000);
            postMessage({ messageType: "snapshot" , price: message.data});
            break;
        case 'p':
            sleep(20000);
            console.log('--- PUBLISH ---' + JSON.stringify(message.data));
            postMessage({ messageType: "update", price: message.data});
            break;
        case 'group_end':
            console.log('--- End SOW Results ---');
            break;
        default:
            console.log("Unexpected message header: ", message.header.command());
    }
}

main().then(() => console.log("AMPS subscription completed."));

