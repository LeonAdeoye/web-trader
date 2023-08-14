const {Client, Command} = require('amps');
const {onAmpsMessage} = require("./message_handler");

const clientName = "web-trader-price-chart-reader";
const topicName = "prices";
const url = "ws://localhost:9008/amps/json";
const client = new Client(clientName);

const initialize = async (symbol) =>
{
    try
    {
        if(client.isConnected())
        {
            console.log("Client is already connected. Disconnecting...");
            await client.disconnect();
        }

        await client.connect(url);
        const cmd = new Command("sow_and_subscribe").topic(topicName).options("select=[-/,+/time_stamp, +/best_ask, +/best_bid, +/symbol]").filter(`/symbol = '${symbol}'`);
        await client.execute(cmd, onAmpsMessage);
        console.log("Price chart reader web worker Connected to AMPS using URL: ", url);
    }
    catch (e)
    {
        console.error(e);
    }
}

onmessage = (message) =>
{
    initialize(message.data.selectedCurrency).then(() => console.log("AMPS subscription completed."));
}

