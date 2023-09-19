const {Client, Command} = require('amps');
const {onAmpsTaskMessage} = require("./message_handler");

const main = async () =>
{
    try
    {
        const clientName = "web-trader-task-reader";
        const topicName = "tasks";
        const url = "ws://localhost:9008/amps/json";
        const client = new Client(clientName);
        await client.connect(url);
        const cmd = new Command("sow_and_subscribe").topic(topicName);
        await client.execute(cmd, onAmpsTaskMessage);
        console.log("Task reader web worker connected to AMPS using URL: ", url);
    }
    catch (e)
    {
        console.error(e);
    }
}

main().then(() => console.log("Task reader AMPS subscription completed."));
