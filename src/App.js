import './App.css';
import {CryptoTickerApp} from "./components/CryptoTickerApp";
import {PriceChartApp} from "./components/PriceChartApp";
import {StockTickerApp} from "./components/StockTickerApp";
import {useEffect, useState} from "react";
import {Client, DefaultServerChooser, DefaultSubscriptionManager} from "amps";

const App = () =>
{
  const [client, setClient] = useState(null);

    const logVersion = async () =>
    {
        const response = await window.versions.logVersions();
        console.log(response);
    }

    useEffect(() =>
    {
        logVersion().then(() => console.log("pinged")).catch((e) => console.log(e));
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

  // Because of the preload script, the renderer has access to the versions global, so let's display that information in the window.
  // This variable can be accessed via window.versions.
  if (!client)
    return (<div>This app is using Chrome (v${window.versions.chrome()}), Node.js (v${window.versions.node()}), and Electron (v${window.versions.electron()}). Loading...</div>);

  return (
    <div className="App">
      <CryptoTickerApp/>
      <PriceChartApp/>
      <StockTickerApp client={client}/>
    </div>
  );
}

export default App;
