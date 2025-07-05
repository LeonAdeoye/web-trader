const { Client, Command } = require('amps');
const { onAmpsOrderMessage } = require("./message_handler");

const main = async () =>
{
    try
    {
        const clientName = "web-trader-order-reader";
        const url = "ws://localhost:9008/amps/json";
        const client = new Client(clientName);

        await client.connect(url);

        const inboundCmd = new Command("sow_and_subscribe").topic("orders.inbound");
        const outboundCmd = new Command("sow_and_subscribe").topic("orders.outbound");

        await client.execute(inboundCmd, onAmpsOrderMessage);
        await client.execute(outboundCmd, onAmpsOrderMessage);

        console.log("Connected to AMPS and subscribed to both inbound and outbound topics.");
    }
    catch (e)
    {
        console.error("Connection or subscription error:", e);
    }
};

main().then(() => console.log("Order reader AMPS subscription initialized."));
