const {Client, Command} = require('amps');
const {onAmpsCrossMessage} = require("./message_handler");
const {getDateToday} = require("../utilities");
const {LoggerService} = require("../services/LoggerService");
let loggerService = new LoggerService("cross-reader.js");

const main = async () =>
{
    try
    {
        const clientName = "web-trader-cross-reader";
        const topicName = "inbound.gui";
        const filter = `/state NOT IN ('DONE_FOR_DAY', 'FULLY_FILLED', 'REJECTED_BY_OMS', 'REJECTED_BY_DESK', 'REJECTED_BY_EXCH', 'CANCELLED_BY_DESK', 'CANCELLED_BY_EXCH') AND /messageType = 'PARENT_ORDER' AND /tradeDate >= ${getDateToday()}`;
        const url = "ws://localhost:9008/amps/json";
        const client = new Client(clientName);
        await client.connect(url);
        const cmd = new Command("sow_and_subscribe").topic(topicName).filter(filter)
        await client.execute(cmd, onAmpsCrossMessage);
        loggerService.logInfo(`Cross reader web worker connected to AMPS using URL: ${url}`);
    }
    catch (e)
    {
        loggerService.logError(`Exception thrown in cross-reader.js: ${e}`);
    }
}

main().then(() => loggerService.logInfo("Cross reader AMPS subscription completed."));
