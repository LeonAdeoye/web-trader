import './App.css';
import {GridTickerApp} from "./components/GridTickerApp";
import {PriceChartApp} from "./components/PriceChartApp";
import {StockTickerApp} from "./components/StockTickerApp";
import React, {useEffect, useState} from "react";
import {Client, DefaultServerChooser, DefaultSubscriptionManager} from "amps";
import LaunchPadApp from "./components/LaunchPadApp";
import { Route, Routes} from "react-router-dom";
import {UsersApp} from "./components/UsersApp";
import {ConfigsApp} from "./components/ConfigsApp";
import {currencyFormatter, numberFormatter} from "./utilities";

const App = () =>
{
    const [client, setClient] = useState(null);

    const cryptoTickerColumnDefinitions = [
        {headerName: "Symbol", field: "symbol", maxWidth: 150, width: 150, pinned: "left", cellDataType: "text"},
        {headerName: "Best Ask", field: "best_ask", cellDataType: "number", valueFormatter: currencyFormatter, maxWidth: 140, width: 140},
        {headerName: "Best Bid", field: "best_bid", cellDataType: "number", valueFormatter: currencyFormatter, maxWidth: 140, width: 140},
        {headerName: "VWAP", field: "vwap_today", cellDataType: "number", valueFormatter: currencyFormatter, maxWidth: 150, width: 150},
        {headerName: "VWAP Last 24h", field: "vwap_24h", cellDataType: "number", valueFormatter: currencyFormatter, maxWidth: 150, width: 150},
        {headerName: "Low", field: "low", cellDataType: "number", valueFormatter: currencyFormatter, maxWidth: 140, width: 140},
        {headerName: "High", field: "high", cellDataType: "number", valueFormatter: currencyFormatter, maxWidth: 140, width: 140},
        {headerName: "Open", field: "open", cellDataType: "number", valueFormatter: currencyFormatter, maxWidth: 140, width: 140},
        {headerName: "Close", field: "close", cellDataType: "number", valueFormatter: currencyFormatter, maxWidth: 140, width: 140},
        {headerName: "Volume", field: "vol_today", cellDataType: "number", valueFormatter: numberFormatter, maxWidth: 150, width: 150},
        {headerName: "Volume Last 24h", field: "vol_24h", cellDataType: "number", valueFormatter: numberFormatter, maxWidth: 160, width: 160},
        {headerName: "Trades", field: "num_trades", cellDataType: "number", valueFormatter: numberFormatter, maxWidth: 130, width: 130},
        {headerName: "Trades Last 24h" , field: "num_trades_24h", cellDataType: "number", valueFormatter: numberFormatter, maxWidth: 150, width: 150}];

    const apps =
        [
            { name: 'Launch Pad', path: '/', component: LaunchPadApp },
            { name: 'Crypto Chart', path: '/crypto-chart', component: PriceChartApp},
            { name: 'Crypto Ticker', path: '/crypto-ticker', component: GridTickerApp, props: {webWorkerUrl: "./price-ticker-reader.js", columnDefs: cryptoTickerColumnDefinitions, rowHeight: 25, gridTheme: "ag-theme-alpine"}},
            { name: 'Stock Ticker', path: '/stock-ticker', component: StockTickerApp, props: {client: client}},
            { name: 'Users', path: '/users', component: UsersApp},
            { name: 'Configs', path: '/configs', component: ConfigsApp}
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
