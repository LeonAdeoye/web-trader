const {Client, Command} = require('amps');
const {onAmpsPriceMessage} = require("./message_handler");
const clientName = "web-trader-price-chart-reader";
const topicName = "prices";
const url = "ws://localhost:9008/amps/json";
const {LoggerService} = require("../services/LoggerService");
let loggerService = new LoggerService("price-chart-reader.js");

const main = async () =>
{
    const client = new Client(clientName);

    const initialize = async (symbol, currentConnectionId) =>
    {
        try
        {
            if(currentConnectionId)
            {
                loggerService.logInfo(`Client is already connected. Disconnecting client with connectionId: ${currentConnectionId}`);
                loggerService.logInfo(`Disconnecting client with connectionId: ${currentConnectionId}`);
                await client.unsubscribe(currentConnectionId);
                await client.disconnect();
            }

            await client.connect(url);
            const cmd = new Command("sow_and_subscribe").topic(topicName).options("select=[-/,+/time_stamp, +/best_ask, +/best_bid, +/symbol]").filter(`/symbol = '${symbol}'`);
            let connectionId = await client.execute(cmd, onAmpsPriceMessage);
            loggerService.logInfo(`New connection Id: ${JSON.stringify(connectionId)}`);
            postMessage({messageType: "connectionId", currentConnectionId: connectionId});
            loggerService.logInfo(`Price chart reader web worker connected to AMPS using URL: ${url}`);
        }
        catch (e)
        {
            loggerService.logError(`Exception thrown in price-chart-reader.js: ${e}`);
        }
    }

    onmessage = (message) =>
    {
        const {symbol, currentConnectionId} = message.data;
        initialize(symbol, currentConnectionId).then(() => console.log("Initialization completed."));
    }
}

main().then(() => loggerService.logInfo("Price chart reader AMPS subscription initialized."));

