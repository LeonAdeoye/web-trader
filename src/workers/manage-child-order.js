const { Client } = require("amps");

const main = async () => {
    try
    {
        const clientName = "manage-child-order";
        const topicName = "orders.gui.outbound";
        const url = "ws://localhost:9008/amps/json";
        const client = new Client(clientName);
        await client.connect(url);
        console.log("Manage order web worker connected to AMPS using URL: ", url);

        onmessage = async function (event)
        {
            const order = event.data;
            switch (order.state) {
                case "ACCEPTED_BY_EXCH":
                case "PARTIALLY_FILLED":
                    try
                    {
                        await client.publish(topicName, order);
                        console.log(`Manage order web worker published message to topic '${topicName}':`, order);
                    }
                    catch (error)
                    {
                        console.error("Manage order web worker failed to publish message:", error);
                    }
                    break;
                default:
                    console.error(`Manage order web worker received an unknown message type: ${order.state}`);
            }
        };
    }
    catch (e)
    {
        console.error(e);
    }
};

main().then(() => console.log("Manage order web worker setup completed."));
