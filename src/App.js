import React from "react";
import {Route, Routes} from "react-router-dom";
import LaunchPadApp from "./apps/LaunchPadApp";
import {UsersApp} from "./apps/UsersApp";
import {ConfigsApp} from "./apps/ConfigsApp";
import {CryptoTickerApp} from "./apps/CryptoTickerApp";
import {StockTickerApp} from "./apps/StockTickerApp";
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
import {InsightsApp} from "./apps/InsightsApp";
import {ReferenceDataApp} from "./apps/ReferenceDataApp";
import {LimitsApp} from "./apps/LimitsApp";
import {ParametricsApp} from "./apps/ParametricsApp";
import RfqDetailsApp from "./apps/RfqDetailsApp";
import RfqWorkflowsApp from "./apps/RfqWorkflowsApp";
import RfqStatsApp from "./apps/RfqStatsApp";
import RfqChartsApp from "./apps/RfqChartsApp";
import {ServicesApp} from "./apps/ServicesApp";
import {CryptoChartApp} from "./apps/CryptoChartApp";

const App = () =>
{
    const apps =
    [
        { name: 'Launch Pad', path: '/', component: LaunchPadApp },
        { name: 'Crypto Chart', path: '/crypto-chart', component: CryptoChartApp },
        { name: 'Crypto Ticker', path: '/crypto-ticker', component: CryptoTickerApp },
        { name: 'Stock Ticker', path: '/stock-ticker', component: StockTickerApp },
        { name: 'Insights', path: '/insights', component: InsightsApp },
        { name: 'Users', path: '/users', component: UsersApp },
        { name: 'Reference Data', path: '/reference-data', component: ReferenceDataApp },
        { name: 'Limits', path: '/limits', component: LimitsApp },
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
        { name: 'RFQ Details', path: '/rfq-details', component: RfqDetailsApp },
        { name: 'RFQ Charts', path: '/rfq-charts', component: RfqChartsApp },
        { name: 'RFQ Workflows', path: '/rfq-workflows', component: RfqWorkflowsApp },
        { name: 'RFQ Stats', path: '/rfq-stats', component: RfqStatsApp },
        { name: 'Parametrics', path: '/parametrics', component: ParametricsApp },
        { name: 'Services', path: '/services', component: ServicesApp }
    ];

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
