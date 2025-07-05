const { Client, Command } = require("amps");

const main = async () => {
    try
    {
        const clientName = "send-order";
        const topicName = "orders";
        const url = "ws://localhost:9008/amps/json";
        const client = new Client(clientName);
        await client.connect(url);
        console.log("Order reader web worker connected to AMPS using URL: ", url);

        onmessage = async function (event)
        {
            const { order } = event.data;

            switch (order.state) {
                case "NEW_ORDER":
                    try
                    {
                        await client.publish(topicName, order);
                        console.log(`Message published to topic '${topicName}':`, order);
                    }
                    catch (error)
                    {
                        console.error("Failed to publish message:", error);
                    }
                    break;
                default:
                    console.error(`Unknown message type: ${order.state}`);
            }
        };
    }
    catch (e)
    {
        console.error(e);
    }
};

main().then(() => console.log("send order completed."));
