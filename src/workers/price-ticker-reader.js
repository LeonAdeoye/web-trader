const {Client, Command} = require('amps');
const {onAmpsPriceMessage} = require("./message_handler");
const {LoggerService} = require("../services/LoggerService");
let loggerService = new LoggerService("price-ticker-reader.js");

const main = async () =>
{
    try
    {
        const clientName = "web-trader-price-ticker-reader";
        const topicName = "prices";
        const url = "ws://localhost:9008/amps/json";
        const client = new Client(clientName);
        await client.connect(url);
        const cmd = new Command("sow_and_delta_subscribe").topic(topicName);
        await client.execute(cmd, onAmpsPriceMessage);
        loggerService.logInfo(`Price ticker reader web worker connected to AMPS using URL: ${url}`);
    }
    catch (e)
    {
        loggerService.logError(`Exception thrown in price-ticker-reader.js: ${e}`);
    }
}

main().then(() => loggerService.logInfo("Price ticker reader AMPS subscription initialized."));


