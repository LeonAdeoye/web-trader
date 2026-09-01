const { Client, Command } = require('amps');
const { onAmpsOrderMessage } = require("./message_handler");
const {LoggerService} = require("../services/LoggerService");
let loggerService = new LoggerService("price-breach-reader.js");

const main = async () =>
{
    try
    {
        const clientName = "web-trader-price-breach-reader";
        const url = "ws://localhost:9008/amps/json";
        const client = new Client(clientName);
        await client.connect(url);
        const inboundCmd = new Command("sow_and_subscribe").topic("trading.price.breach");
        await client.execute(inboundCmd, onAmpsOrderMessage);
        loggerService.logInfo(`Price breach reader web worker connected to AMPS using URL: ${url}`);
    }
    catch (e)
    {
        loggerService.logError(`Exception thrown in price-breach-reader.js: ${e}`);
    }
};

main().then(() => loggerService.logInfo("Price breach reader AMPS subscription initialized."));
