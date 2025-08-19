const { Client, Command } = require('amps');
const { onAmpsOrderMessage } = require("./message_handler");
const {LoggerService} = require("../services/LoggerService");
let loggerService = new LoggerService("notional-breach-reader.js");

const main = async () =>
{
    try
    {
        const clientName = "web-trader-notional-breach-reader";
        const url = "ws://localhost:9008/amps/json";
        const client = new Client(clientName);
        await client.connect(url);
        const inboundCmd = new Command("sow_and_subscribe").topic("trading.limit.breach");
        await client.execute(inboundCmd, onAmpsOrderMessage);
        loggerService.logInfo(`Notional breach reader web worker connected to AMPS using URL: ${url}`);
    }
    catch (e)
    {
        loggerService.logError(`Exception thrown in notional-breach-reader.js: ${e}`);
    }
};

main().then(() => loggerService.logInfo("Notional breach reader AMPS subscription initialized."));
