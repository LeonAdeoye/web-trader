const { Client } = require("amps");
const {LoggerService} = require("../services/LoggerService");
let loggerService = new LoggerService("send-order.js");

const main = async () => {
    try
    {
        const clientName = "send-order";
        const topicName = "outbound.gui";
        const url = "ws://localhost:9008/amps/json";
        const client = new Client(clientName);
        await client.connect(url);
        loggerService.logInfo(`Send order web worker connected to AMPS using URL: ${url}`);

        onmessage = async function (event)
        {
            const { order } = event.data;

            switch (order.state) {
                case "NEW_ORDER":
                    try
                    {
                        await client.publish(topicName, order);
                        loggerService.logInfo(`Send order web worker published message on topic '${topicName}': ${JSON.stringify(order)}`);
                    }
                    catch (error)
                    {
                        loggerService.logError(`Send order web worker failed to publish message: ${error}`);
                    }
                    break;
                default:
                    loggerService.logError(`Send order web worker received an unknown message type: ${order.state}`);
            }
        };
    }
    catch (e)
    {
        loggerService.logError(`Exception thrown in send-order.js: ${e}`);
    }
};

main().then(() => loggerService.logInfo("Send Order AMPS subscription initialized."));
