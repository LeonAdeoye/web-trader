const { Client, Command } = require('amps');
const { onAmpsOrderMessage } = require("./message_handler");
const {LoggerService} = require("../services/LoggerService");
let loggerService = new LoggerService("order-reader.js");

const main = async () =>
{
    try
    {
        const clientName = "web-trader-order-reader";
        const url = "ws://localhost:9008/amps/json";
        const client = new Client(clientName);
        await client.connect(url);
        const inboundCmd = new Command("sow_and_subscribe").topic("inbound.gui").filter("/messageType = 'PARENT_ORDER'");
        await client.execute(inboundCmd, onAmpsOrderMessage);
        loggerService.logInfo(`Order reader web worker connected to AMPS using URL: ${url}`);
    }
    catch (e)
    {
        loggerService.logError(`Exception thrown in order-reader.js: ${e}`);
    }
};

main().then(() => loggerService.logInfo("Order reader AMPS subscription initialized."));
