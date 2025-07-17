import {GridTickerApp} from "./apps/GridTickerApp";
import {PriceChartApp} from "./apps/PriceChartApp";
import {StockTickerApp} from "./apps/StockTickerApp";
import React, {useEffect, useState, useRef} from "react";
import {Client, DefaultServerChooser, DefaultSubscriptionManager} from "amps";
import LaunchPadApp from "./apps/LaunchPadApp";
import { Route, Routes} from "react-router-dom";
import {UsersApp} from "./apps/UsersApp";
import {ConfigsApp} from "./apps/ConfigsApp";
import {ConfigurationService} from "./services/ConfigurationService";
import {LoggerService} from "./services/LoggerService";
import CrossesApp from "./apps/CrossesApp";
import {FxRatesApp} from "./apps/FxRatesApp";
import TradeHistoryApp from "./apps/TradeHistoryApp";
import HoldingsApp from "./apps/HoldingsApp";
import TaskListApp from "./apps/TaskListApp";
import {AlertsApp} from "./apps/AlertsApp";
import {OrdersApp} from "./apps/OrdersApp";
import {BasketsApp} from "./apps/BasketsApp";
import {BasketChartApp} from "./apps/BasketChartApp";
import {ClientInterestsApp} from "./apps/ClientInterestsApp";
import {BlastsApp} from "./apps/BlastsApp";
import {AlertConfigurationsApp} from "./apps/AlertConfigurationsApp";
import {AlertWizardApp} from "./dialogs/AlertWizardApp";
import {NewOrderApp} from "./apps/NewOrderApp";
import {NewBasketApp} from "./apps/NewBasketApp";
import {ChildOrdersApp} from "./apps/ChildOrdersApp";
import {RfqsApp} from "./apps/RfqsApp";


const App = ({}) =>
{
    const [client, setClient] = useState(null);
    const configurationService = useRef(new ConfigurationService()).current;
    const loggerService = useRef(new LoggerService(App.name)).current;

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
            { name: 'New Order', path: '/new-order', component: NewOrderApp },
            { name: 'New Basket', path: '/new-basket', component: NewBasketApp },
            { name: 'Child Orders', path: '/child-orders', component: ChildOrdersApp},
            { name: 'Trade History', path: '/trade-history', component: TradeHistoryApp },
            { name: 'Configs', path: '/configs', component: ConfigsApp},
            { name: 'Baskets', path: '/baskets', component: BasketsApp},
            { name: 'Basket Chart', path: '/basket-chart', component: BasketChartApp},
            { name: 'Client Interests', path: '/client-interests', component: ClientInterestsApp},
            { name: 'Blasts', path: '/blasts', component: BlastsApp},
            { name: 'Alert Configurations', path: '/alert-configurations', component: AlertConfigurationsApp},
            { name: 'Alert Wizard', path: '/alert-wizard', component: AlertWizardApp},
            { name: 'Request For Quote', path: '/rfq', component: RfqsApp },
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
        return (<div id="loading">Loading...</div>);

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
