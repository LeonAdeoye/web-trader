const {Client, Command} = require('amps');
const {onAmpsFxRateMessage} = require("./message_handler");

const main = async () =>
{
    try
    {
        const clientName = "fx-rate-reader";
        const topicName = "fx-rates";
        const url = "ws://localhost:9008/amps/json";
        const client = new Client(clientName);
        await client.connect(url);
        const cmd = new Command("sow_and_delta_subscribe").topic(topicName);
        await client.execute(cmd, onAmpsFxRateMessage);
        console.log("FX rate reader web worker Connected to AMPS using URL: ", url);
    }
    catch (e)
    {
        console.error(e);
    }
}

main().then(() => console.log("AMPS subscription completed."));
