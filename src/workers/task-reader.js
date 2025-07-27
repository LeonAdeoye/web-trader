const {Client, Command} = require('amps');
const {onAmpsTaskMessage} = require("./message_handler");
const {LoggerService} = require("../services/LoggerService");
let loggerService = new LoggerService("task-reader.js");

const main = async () =>
{
    try
    {
        const clientName = "web-trader-task-reader";
        const topicName = "tasks";
        const url = "ws://localhost:9008/amps/json";
        const client = new Client(clientName);
        await client.connect(url);
        const cmd = new Command("sow_and_subscribe").topic(topicName);
        await client.execute(cmd, onAmpsTaskMessage);
        loggerService.logInfo(`Task reader web worker connected to AMPS using URL: ${url}`);
    }
    catch (e)
    {
        loggerService.logError(`Exception thrown in task-reader.js: ${e}`);
    }
}

main().then(() => loggerService.logInfo("Task reader AMPS subscription initialized."));
