const {Client, Command} = require('amps');
//const config = require('config');
//let clientName = config.get('price-reader.amps-client-name');

async function main()
{
    try
    {
        const client = new Client("web-trader-price-reader");
        await client.connect("ws://localhost:9008/amps/json")
        await client.subscribe(onAmpsMessage, "prices");
        console.log("Connected to AMPS using URL: ws://localhost:9008/amps/json.");
        //await client.disconnect();
    }
    catch (e)
    {
        console.log(e);
    }
}

const onAmpsMessage = (message) =>
{
    postMessage(message.data);
}

main().then(() => console.log("done"));

