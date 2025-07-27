const {Client, Command} = require('amps');
const {onAmpsAlertMessage} = require("./message_handler");
const {LoggerService} = require("../services/LoggerService");
let loggerService = new LoggerService("alert-reader.js");

const main = async () =>
{
    try
    {
        const clientName = "web-trader-alert-reader";
        const topicName = "alerts";
        const url = "ws://localhost:9008/amps/json";
        const client = new Client(clientName);
        await client.connect(url);
        const cmd = new Command("sow_and_subscribe").topic(topicName);
        await client.execute(cmd, onAmpsAlertMessage);
        loggerService.logInfo(`Alert reader web worker connected to AMPS using URL: ${url}`);
    }
    catch (e)
    {
        loggerService.logError(`Exception thrown in alert-reader.js: ${e}`);
    }
}

main().then(() => loggerService.logInfo("Alert reader AMPS subscription initialized."));
