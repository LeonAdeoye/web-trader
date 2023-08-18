import './App.css';
import {CryptoTickerApp} from "./components/CryptoTickerApp";
import {PriceChartApp} from "./components/PriceChartApp";
import {StockTickerApp} from "./components/StockTickerApp";
import React, {useEffect, useState} from "react";
import {Client, DefaultServerChooser, DefaultSubscriptionManager} from "amps";
import LaunchPadApp from "./components/LaunchPadApp";
import { Route, Routes} from "react-router-dom";

const App = () =>
{
    const [client, setClient] = useState(null);

    const apps =
        [
            { name: 'Launch Pad', path: '/', component: LaunchPadApp },
            { name: 'Crypto Chart', path: '/crypto-chart', component: PriceChartApp},
            { name: 'Crypto Ticker', path: '/crypto-ticker', component: CryptoTickerApp },
            { name: 'Stock Ticker', path: '/stock-ticker', component: StockTickerApp, props: {client: client}}
        ];

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

  // TODO refactor into generic ticker and chart apps so can have one for crypto and one for stocks
  return (
    <div className="App">
        <Routes>
            {apps.map((app, index) => (
                <Route
                    key={index}
                    path={app.path}
                    element={React.createElement(app.component, app.props ?? {})}
                />
            ))}
        </Routes>
    </div>
  );
}

export default App;
