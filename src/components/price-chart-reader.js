const {Client, Command} = require('amps');
const {onAmpsMessage} = require("./message_handler");

const clientName = "web-trader-price-chart-reader";
const topicName = "prices";
const url = "ws://localhost:9008/amps/json";

const main = async () =>
{
    const client = new Client(clientName);

    const initialize = async (symbol, currentConnectionId) =>
    {
        try
        {
            if(currentConnectionId)
            {
                console.log("Client is already connected. Disconnecting client with connectionId: " + currentConnectionId);
                await client.unsubscribe(currentConnectionId);
                await client.disconnect();
            }

            await client.connect(url);
            const cmd = new Command("sow_and_subscribe").topic(topicName).options("select=[-/,+/time_stamp, +/best_ask, +/best_bid, +/symbol]").filter(`/symbol = '${symbol}'`);
            let connectionId = await client.execute(cmd, onAmpsMessage);
            console.log("New connection Id: " + JSON.stringify(connectionId));
            postMessage({messageType: "connectionId", currentConnectionId: connectionId});
            console.log("Price chart reader web worker Connected to AMPS using URL: ", url);
        }
        catch (e)
        {
            console.error(e);
        }
    }

    onmessage = (message) =>
    {
        const {selectedCurrency, currentConnectionId} = message.data;
        initialize('XBT/USD', currentConnectionId).then(() => console.log("Initialization completed."));
    }
}

main().then(() => console.log("AMPS subscription completed."));

