const { Client } = require("amps");

const main = async () => {
    try
    {
        const clientName = "send-order";
        const topicName = "outbound.gui";
        const url = "ws://localhost:9008/amps/json";
        const client = new Client(clientName);
        await client.connect(url);
        console.log("Send order web worker connected to AMPS using URL: ", url);

        onmessage = async function (event)
        {
            const { order } = event.data;

            switch (order.state) {
                case "NEW_ORDER":
                    try
                    {
                        await client.publish(topicName, order);
                        console.log(`Send order web worker published message on topic '${topicName}':`, order);
                    }
                    catch (error)
                    {
                        console.error("Send order web worker failed to publish message:", error);
                    }
                    break;
                default:
                    console.error(`Send order web worker received an unknown message type: ${order.state}`);
            }
        };
    }
    catch (e)
    {
        console.error(e);
    }
};

main().then(() => console.log("Send order web worker setup completed."));
