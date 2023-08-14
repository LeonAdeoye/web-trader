const {Client, Command} = require('amps');
const {onAmpsMessage} = require("./message_handler");

const main = async () =>
{
    try
    {
        const clientName = "web-trader-price-ticker-reader";
        const topicName = "prices";
        const url = "ws://localhost:9008/amps/json";
        const client = new Client(clientName);
        await client.connect(url);
        const cmd = new Command("sow_and_delta_subscribe").topic(topicName);
        await client.execute(cmd, onAmpsMessage);
        console.log("Price ticker reader web worker Connected to AMPS using URL: ", url);
    }
    catch (e)
    {
        console.error(e);
    }
}

main().then(() => console.log("AMPS subscription completed."));


