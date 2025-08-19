const { Client, Command } = require('amps');
const { onAmpsOrderMessage } = require("./message_handler");
const {LoggerService} = require("../services/LoggerService");
let loggerService = new LoggerService("desk-notional-reader.js");

const main = async () =>
{
    try
    {
        const clientName = "web-trader-desk-notional-reader";
        const url = "ws://localhost:9008/amps/json";
        const client = new Client(clientName);
        await client.connect(url);
        const inboundCmd = new Command("sow_and_subscribe").topic("desk.notional.update");
        await client.execute(inboundCmd, onAmpsOrderMessage);
        loggerService.logInfo(`Desk notional reader web worker connected to AMPS using URL: ${url}`);
    }
    catch (e)
    {
        loggerService.logError(`Exception thrown in desk-notional-reader.js: ${e}`);
    }
};

main().then(() => loggerService.logInfo("Desk notional reader AMPS subscription initialized."));
