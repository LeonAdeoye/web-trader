const { Client } = require("amps");
const {LoggerService} = require("../services/LoggerService");
let loggerService = new LoggerService("manager-child-order.js");

const main = async () => {
    try
    {
        const clientName = "manage-child-order";
        const topicName = "outbound.gui";
        const url = "ws://localhost:9008/amps/json";
        const client = new Client(clientName);
        await client.connect(url);
        loggerService.logInfo(`Manage order web worker connected to AMPS using URL: ${url}`);

        onmessage = async function (event)
        {
            const order = event.data;
            switch (order.state) {
                case "ACCEPTED_BY_EXCH":
                case "PARTIALLY_FILLED":
                    try
                    {
                        await client.publish(topicName, order);
                        loggerService.logInfo(`Manage order web worker published message to topic '${topicName}': ${JSON.stringify(order)}`);
                    }
                    catch (error)
                    {
                        loggerService.logError(`Manage order web worker failed to publish message: ${error}`);
                    }
                    break;
                default:
                    loggerService.logError(`Manage order web worker received an unknown message type: ${order.state}`);
            }
        };
    }
    catch (e)
    {
        loggerService.logError(`Exception thrown in manage-child-order.js: ${e}`);
    }
};

main().then(() => loggerService.logInfo("Manager Child Order AMPS subscription initialized."));

