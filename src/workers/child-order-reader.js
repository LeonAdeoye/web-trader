const { Client, Command } = require('amps');
const { onAmpsOrderMessage } = require("./message_handler");
const {LoggerService} = require("../services/LoggerService");
let loggerService = new LoggerService("child-order-reader.js");

const main = async () =>
{
    try
    {
        const clientName = "child-order-reader";
        const url = "ws://localhost:9008/amps/json";
        const client = new Client(clientName);
        await client.connect(url);
        const inboundCmd = new Command("sow_and_subscribe").topic("inbound.gui").filter("/messageType = 'CHILD_ORDER'");
        await client.execute(inboundCmd, onAmpsOrderMessage);
        loggerService.logInfo(`Child order reader web worker connected to AMPS using URL: ${url}`);
    }
    catch (e)
    {
        loggerService.logError(`Exception thrown in child-order-reader.js: ${e}`);
    }
};

main().then(() => loggerService.logInfo("Child order reader AMPS subscription initialized."));
