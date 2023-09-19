const {Client, Command} = require('amps');
const {onAmpsOrderMessage} = require("./message_handler");

const main = async () =>
{
    try
    {
        const clientName = "web-trader-order-reader";
        const topicName = "orders";
        const url = "ws://localhost:9008/amps/json";
        const client = new Client(clientName);
        await client.connect(url);
        const cmd = new Command("sow_and_subscribe").topic(topicName);
        await client.execute(cmd, onAmpsOrderMessage);
        console.log("Order reader web worker connected to AMPS using URL: ", url);
    }
    catch (e)
    {
        console.error(e);
    }
}

main().then(() => console.log("Order reader AMPS subscription completed."));
