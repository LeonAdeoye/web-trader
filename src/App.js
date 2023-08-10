import './App.css';
import {CryptoTickerApp} from "./components/CryptoTickerApp";
import {PriceChartApp} from "./components/PriceChartApp";
import {StockTickerApp} from "./components/StockTickerApp";
import {useEffect, useState} from "react";
import {Client, DefaultServerChooser, DefaultSubscriptionManager} from "amps";

const App = () =>
{
  const [client, setClient] = useState(null);

    useEffect(() =>
    {
        // create the server chooser
        const chooser = new DefaultServerChooser();
        chooser.add(`ws://localhost:9008/amps/json`);

        // create the AMPS HA client object
        const client = new Client('web-trader-market-data-subscriber');
        client.serverChooser(chooser);
        client.subscriptionManager(new DefaultSubscriptionManager());

        // now we can establish connection and update the state
        client.connect().then(() =>
        {
            setClient(client);
            console.log("connected to ws://localhost:9008/amps/json");
        });

        // disconnect the client from AMPS when the component is destructed
        return () =>
        {
            client.disconnect().then(() => console.log('disconnected'));
        };
    }, []);

  if (!client)
    return (<div>Loading...</div>);

  return (
    <div className="App">
      <CryptoTickerApp/>
      <PriceChartApp/>
      <StockTickerApp client={client}/>
    </div>
  );
}

export default App;
