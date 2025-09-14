const {Client, Command} = require('amps');
const {onAmpsCryptoPriceMessage} = require("./message_handler");
const {LoggerService} = require("../services/LoggerService");
let loggerService = new LoggerService("crypto-price-reader.js");

const main = async () =>
{
    try
    {
        const clientName = "web-trader-crypto-price-reader";
        const topicName = "crypto.data";
        const url = "ws://localhost:9008/amps/json";
        const client = new Client(clientName);
        await client.connect(url);
        const cmd = new Command("sow_and_delta_subscribe").topic(topicName);
        await client.execute(cmd, onAmpsCryptoPriceMessage);
        loggerService.logInfo(`Crypto price reader web worker connected to AMPS using URL: ${url}`);
    }
    catch (e)
    {
        loggerService.logError(`Exception thrown in crypto-price-reader.js: ${e}`);
    }
}

main().then(() => loggerService.logInfo("Crypto price reader AMPS subscription initialized."));
