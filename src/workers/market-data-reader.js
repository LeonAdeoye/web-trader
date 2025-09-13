const { Client, Command} = require('amps');
const {onAmpsMarketDataMessage} = require("./message_handler");

let client = null;
let isConnected = false;
const {LoggerService} = require("../services/LoggerService");
let loggerService = new LoggerService("market-data-reader.js");

const main = async () =>
{
    try
    {
        client = new Client("web-trader-market-data-reader");
        const url = "ws://localhost:9008/amps/json";
        await client.connect(url);
        const inboundCmd = new Command("sow_and_subscribe").topic("market.data");
        await client.execute(inboundCmd, onAmpsMarketDataMessage);
        loggerService.logInfo(`Market data web worker connected to AMPS using URL: ${url}`);
        return true;
    }
    catch (error)
    {
        loggerService.logError('Market data reader failed to connect to AMPS:', error);
        isConnected = false;
        return false;
    }
};

main().then(() => loggerService.logInfo("Market data reader AMPS subscription initialized."));
