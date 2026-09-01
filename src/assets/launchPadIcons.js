import alertConfigurationsIcon from './launch-pad/alert-configurations.png';
import alertsIcon from './launch-pad/alerts.png';
import basketChartIcon from './launch-pad/basket-chart.png';
import basketsIcon from './launch-pad/baskets.png';
import stockChartIcon from './launch-pad/chart.png';
import childOrdersIcon from './launch-pad/child-orders.png';
import clientBlastsIcon from './launch-pad/client-blasts.png';
import clientInterestsIcon from './launch-pad/client-interests.png';
import configurationsIcon from './launch-pad/configurations.png';
import crossesIcon from './launch-pad/crosses.png';
import cryptoChartIcon from './launch-pad/crypto-chart.png';
import cryptoTickerIcon from './launch-pad/crypto-ticker.png';
import dashboardIcon from './launch-pad/dashboard.png';
import fxRatesIcon from './launch-pad/fx-rates.png';
import holdingsIcon from './launch-pad/holdings.png';
import indexPricingIcon from './launch-pad/index-pricing.png';
import insightsIcon from './launch-pad/insights.png';
import ioisIcon from './launch-pad/iois.png';
import limitsIcon from './launch-pad/limits.png';
import newBasketIcon from './launch-pad/new-basket.png';
import newOrderIcon from './launch-pad/new-order.png';
import newsIcon from './launch-pad/news.png';
import ordersIcon from './launch-pad/orders.png';
import parametricsIcon from './launch-pad/parametrics.png';
import positionKeepingIcon from './launch-pad/position-keeping.png';
import referenceDataIcon from './launch-pad/reference-data.png';
import reportsIcon from './launch-pad/reports.png';
import requestForQuoteIcon from './launch-pad/request-for-quote.png';
import searchBarIcon from './launch-pad/search-bar.png';
import servicesIcon from './launch-pad/services.png';
import stockTickerIcon from './launch-pad/stock-ticker.png';
import tasksIcon from './launch-pad/tasks.png';
import tcaIcon from './launch-pad/tca.png';
import tradeHistoryIcon from './launch-pad/trade-history.png';
import usersIcon from './launch-pad/users.png';
import workflowIcon from './launch-pad/workflow.png';

const LAUNCH_PAD_ICONS =
{
    'Alert Configurations': alertConfigurationsIcon,
    'Alerts': alertsIcon,
    'Basket Chart': basketChartIcon,
    'Baskets': basketsIcon,
    'Stock Chart': stockChartIcon,
    'Child Orders': childOrdersIcon,
    'Client Blasts': clientBlastsIcon,
    'Client Interests': clientInterestsIcon,
    'Configurations': configurationsIcon,
    'Crosses': crossesIcon,
    'Crypto Chart': cryptoChartIcon,
    'Crypto Ticker': cryptoTickerIcon,
    'Dashboard': dashboardIcon,
    'Fx Rates': fxRatesIcon,
    'Holdings': holdingsIcon,
    'Index Pricing': indexPricingIcon,
    'Insights': insightsIcon,
    'IOIs': ioisIcon,
    'Limits': limitsIcon,
    'New Basket': newBasketIcon,
    'New Order': newOrderIcon,
    'News': newsIcon,
    'Orders': ordersIcon,
    'Parametrics': parametricsIcon,
    'Position Keeping': positionKeepingIcon,
    'Reference Data': referenceDataIcon,
    'Reports': reportsIcon,
    'Request For Quote': requestForQuoteIcon,
    'Search Bar': searchBarIcon,
    'Services': servicesIcon,
    'Stock Ticker': stockTickerIcon,
    'Tasks': tasksIcon,
    'TCA': tcaIcon,
    'Trade History': tradeHistoryIcon,
    'Users': usersIcon,
    'Workflow': workflowIcon
};

export const getLaunchPadIconSrc = (title) =>
{
    if (!title)
        return null;

    if (LAUNCH_PAD_ICONS[title])
        return LAUNCH_PAD_ICONS[title];

    if (title.startsWith('Request For Quote'))
        return LAUNCH_PAD_ICONS['Request For Quote'];

    if (title.startsWith('Alert Configurations'))
        return LAUNCH_PAD_ICONS['Alert Configurations'];

    return null;
};
