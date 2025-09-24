const { Client, Command } = require('amps');
const { onAmpsRfqMessage } = require("./message_handler");
const {LoggerService} = require("../services/LoggerService");
let loggerService = new LoggerService("read-rfq.js");

const main = async () =>
{
    try
    {
        const clientName = "web-trader-rfq-reader";
        const url = "ws://localhost:9008/amps/json";
        const client = new Client(clientName);
        await client.connect(url);
        const inboundCmd = new Command("sow_and_subscribe").topic("inbound.gui.rfq");
        await client.execute(inboundCmd, onAmpsRfqMessage);
        loggerService.logInfo(`RFQ reader web worker connected to AMPS using URL: ${url}`);
    }
    catch (e)
    {
        loggerService.logError(`Exception thrown in read-rfq.js: ${e}`);
    }
};

main().then(() => loggerService.logInfo("RFQ reader AMPS subscription initialized."));
