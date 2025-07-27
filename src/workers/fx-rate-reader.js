const {Client, Command} = require('amps');
const {onAmpsFxRateMessage} = require("./message_handler");
const {LoggerService} = require("../services/LoggerService");
let loggerService = new LoggerService("fx-rate-reader.js");

const main = async () =>
{
    try
    {
        const clientName = "web-trader-fx_rate_reader";
        const topicName = "agg_fx_rates";
        const url = "ws://localhost:9008/amps/json";
        const client = new Client(clientName);
        await client.connect(url);
        const cmd = new Command("sow_and_subscribe").topic(topicName);
        await client.execute(cmd, onAmpsFxRateMessage);
        loggerService.logInfo(`FX rate reader web worker connected to AMPS using URL: ${url}`);
    }
    catch (e)
    {
        loggerService.logError(`Exception thrown in fx-rate-reader.js: ${e}`);
    }
}

main().then(() => loggerService.logInfo("FX rate reader AMPS subscription initialized."));
