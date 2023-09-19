const {Client, Command} = require('amps');
const {onAmpsCrossMessage} = require("./message_handler");

const main = async () =>
{
    try
    {
        const clientName = "web-trader-cross-reader";
        const topicName = "crosses";
        const url = "ws://localhost:9008/amps/json";
        const client = new Client(clientName);
        await client.connect(url);
        const cmd = new Command("sow_and_subscribe").topic(topicName);
        await client.execute(cmd, onAmpsCrossMessage);
        console.log("Cross reader web worker connected to AMPS using URL: ", url);
    }
    catch (e)
    {
        console.error(e);
    }
}

main().then(() => console.log("Cross reader AMPS subscription completed."));
