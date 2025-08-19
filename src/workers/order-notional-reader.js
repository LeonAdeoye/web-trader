const { Client, Command } = require('amps');
const { onAmpsOrderMessage } = require("./message_handler");
const {LoggerService} = require("../services/LoggerService");
let loggerService = new LoggerService("order-notional-reader.js");

const main = async () =>
{
    try
    {
        const clientName = "web-trader-order-notional-reader";
        const url = "ws://localhost:9008/amps/json";
        const client = new Client(clientName);
        await client.connect(url);
        const inboundCmd = new Command("sow_and_subscribe").topic("desk.notional.update");
        await client.execute(inboundCmd, onAmpsOrderMessage);
        loggerService.logInfo(`Order notional reader web worker connected to AMPS using URL: ${url}`);
    }
    catch (e)
    {
        loggerService.logError(`Exception thrown in order-notional-reader.js: ${e}`);
    }
};

main().then(() => loggerService.logInfo("Order notional reader AMPS subscription initialized."));
