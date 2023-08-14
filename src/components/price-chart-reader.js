const {Client, Command} = require('amps');
const {onAmpsMessage} = require("./message_handler");

const main = async () =>
{
    try
    {
        const clientName = "web-trader-price-chart-reader";
        const topicName = "prices";
        const url = "ws://localhost:9008/amps/json";
        const client = new Client(clientName);
        await client.connect(url);
        const cmd = new Command("sow_and_subscribe").topic(topicName).options("select=[-/,+/time_stamp, +/best_ask, +/best_bid, +/symbol]");
        await client.execute(cmd, onAmpsMessage);
        console.log("Price chart reader web worker Connected to AMPS using URL: ", url);
    }
    catch (e)
    {
        console.error(e);
    }
}

main().then(() => console.log("AMPS subscription completed."));

