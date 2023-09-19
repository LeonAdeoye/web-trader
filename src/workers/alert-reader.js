const {Client, Command} = require('amps');
const {onAmpsAlertMessage} = require("./message_handler");

const main = async () =>
{
    try
    {
        const clientName = "web-trader-alert-reader";
        const topicName = "alerts";
        const url = "ws://localhost:9008/amps/json";
        const client = new Client(clientName);
        await client.connect(url);
        const cmd = new Command("sow_and_subscribe").topic(topicName);
        await client.execute(cmd, onAmpsAlertMessage);
        console.log("Alert reader web worker connected to AMPS using URL: ", url);
    }
    catch (e)
    {
        console.error(e);
    }
}

main().then(() => console.log("Alert reader AMPS subscription completed."));
