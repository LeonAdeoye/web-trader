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
import {ConfigurationService} from "./services/ConfigurationService";
import {LoggerService} from "./services/LoggerService";
import CrossesApp from "./components/CrossesApp";
import {FxRatesApp} from "./components/FxRatesApp";
import TradeHistoryApp from "./components/TradeHistoryApp";
import HoldingsApp from "./components/HoldingsApp";
import TaskListApp from "./components/TaskListApp";
import {AlertsApp} from "./components/AlertsApp";
import {OrdersApp} from "./components/OrdersApp";
import {BasketsApp} from "./components/BasketsApp";


const App = ({}) =>
{
    const [client, setClient] = useState(null);
    const [configurationService] = useState(new ConfigurationService());
    const [loggerService] = useState(new LoggerService(App.name));

    const apps =
        [
            { name: 'Launch Pad', path: '/', component: LaunchPadApp },
            { name: 'Crypto Chart', path: '/crypto-chart', component: PriceChartApp, props: {webWorkerUrl: "./price-chart-reader.js", interval: 10, chartTheme: 'ag-default'} },
            { name: 'Crypto Ticker', path: '/crypto-ticker', component: GridTickerApp, props: {webWorkerUrl: "./price-ticker-reader.js"} },
            { name: 'Stock Ticker', path: '/stock-ticker', component: StockTickerApp, props: {client: client} },
            { name: 'Users', path: '/users', component: UsersApp },
            { name: 'Orders', path: '/orders', component: OrdersApp},
            { name: 'Alerts', path: '/alerts', component: AlertsApp },
            { name: 'Crosses', path: '/crosses', component: CrossesApp },
            { name: 'Fx Rates', path: '/fx-rates', component: FxRatesApp },
            { name: 'Holdings', path: '/holdings', component: HoldingsApp },
            { name: 'Tasks', path: '/tasks', component: TaskListApp },
            { name: 'Trade History', path: '/trade-history', component: TradeHistoryApp },
            { name: 'Configs', path: '/configs', component: ConfigsApp},
            { name: 'Baskets', path: '/baskets', component: BasketsApp}
        ];

    useEffect( () =>
    {
        configurationService.loadConfigurations('system')
            .then(() => loggerService.logInfo("Successfully Loaded all configurations."));
    }, []);

    // TODO move this inside the component.
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
            loggerService.logInfo("connected to ws://localhost:9008/amps/json");
        });

        // disconnect the client from AMPS when the component is destructed
        return () =>
        {
            client.disconnect().then(() => loggerService.logInfo('disconnected from AMPS'));
        };
    }, []);

    if (!client)
        return (<div>Loading...</div>);

  // TODO refactor into generic ticker and chart apps so can have one for crypto and one for stocks
  return (
    <div className="App">
        {<Routes>
            {apps.map((app, index) =>
                (<Route
                    key={index}
                    path={app.path}
                    element={React.createElement(app.component, app.props ?? {})}
                />))}
        </Routes>}
    </div>
  );
}

export default App;
