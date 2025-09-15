import React, {useState, useMemo, useRef, useCallback, useEffect} from 'react';
import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-balham.css';
import { TabContext, TabList, TabPanel } from '@mui/lab';
import '../styles/css/main.css';
import {Tab} from "@mui/material";
import TitleBarComponent from "../components/TitleBarComponent";
import {LoggerService} from "../services/LoggerService";
import {HorizontalBarChartComponent} from "../components/HorizontalBarChartComponent";
import {defaultIfBlank, getDateMinusDays, safeDouble} from "../utilities";
import { useRecoilState } from 'recoil';
import { insightsConfigPanelOpenState } from '../atoms/component-state';
import InsightsConfigPanel from "../components/InsightsConfigPanel";
import { ServiceRegistry } from '../services/ServiceRegistry';

export const InsightsApp = () =>
{
    const loggerService = useRef(new LoggerService(InsightsApp.name)).current;
    const windowId = useMemo(() => window.command.getWindowId("Insights"), []);
    const [selectedTab, setSelectedTab] = useState("1");
    const [isConfigOpen, setIsConfigOpen] = useRecoilState(insightsConfigPanelOpenState);
    const [appliedShowWorkingTotals, setAppliedShowWorkingTotals] = useState(false);
    const [appliedMetric, setAppliedMetric] = useState('shares');
    const [appliedDateMode, setAppliedDateMode] = useState('today');
    const [appliedDateRangeDays, setAppliedDateRangeDays] = useState(10);
    const [appliedMaxBars, setAppliedMaxBars] = useState(5);
    const [insightsData, setInsightsData] = useState([]);
    const [inboundWorker, setInboundWorker] = useState(null);
    const [orders, setOrders] = useState([]);
    const [ownerId, setOwnerId] = useState(null);
    const configurationService = useRef(ServiceRegistry.getConfigurationService()).current;
    const instrumentService = useRef(ServiceRegistry.getInstrumentService()).current;

    const INSIGHTS_CONFIG_KEYS = [
        'insights_metric',
        'insights_showWorkingTotals',
        'insights_orderSellColor',
        'insights_executedSellColor',
        'insights_orderBuyColor',
        'insights_executedBuyColor',
        'insights_workingBuyColor',
        'insights_workingSellColor',
        'insights_dateMode',
        'insights_dateRangeDays',
        'insights_maxBars'
    ];


    const [config, setConfig] = useState({
        metric: 'shares',
        showWorkingTotals: false,
        orderSellColor: '#f44336',
        executedSellColor: '#e57373',
        orderBuyColor: '#528c74',
        executedBuyColor: '#81c784',
        workingBuyColor: '#66a7bb',
        workingSellColor: '#d9a9a7',
        dateMode: 'today',
        dateRangeDays: 10,
        maxBars: 5
    });
    
    const [appliedColors, setAppliedColors] = useState({
        orderSellColor: '#f44336',
        executedSellColor: '#e57373',
        orderBuyColor: '#528c74',
        executedBuyColor: '#81c784',
        workingBuyColor: '#66a7bb',
        workingSellColor: '#d9a9a7'
    });

    useEffect(() =>
    {
        const loadOwner = async () => setOwnerId(await window.configurations.getLoggedInUserId());
        loadOwner();
    }, []);

    useEffect(() =>
    {
        const loadInstruments = async () =>
        {
            await instrumentService.loadInstruments();
        };
        loadInstruments().then(() => loggerService.logInfo("Instruments loaded successfully."));
    }, [instrumentService, loggerService]);

    const updateAppliedStates = useCallback((config) => {
        setAppliedColors({
            orderSellColor: config.orderSellColor,
            executedSellColor: config.executedSellColor,
            orderBuyColor: config.orderBuyColor,
            executedBuyColor: config.executedBuyColor,
            workingBuyColor: config.workingBuyColor,
            workingSellColor: config.workingSellColor
        });
        setAppliedShowWorkingTotals(config.showWorkingTotals === true);
        setAppliedMetric(config.metric);
        setAppliedDateMode(config.dateMode);
        setAppliedDateRangeDays(config.dateRangeDays);
        setAppliedMaxBars(Math.max(1, parseInt(config.maxBars, 10) || 1));
    }, []);


    const loadConfiguration = useCallback(async () => 
    {
        try 
        {
            if (!ownerId)
                return;

            await configurationService.loadConfigurations(ownerId);
            const allConfigs = configurationService.getConfigsBelongingToOwner(ownerId);
            const insightsConfigs = allConfigs.filter(config => 
                INSIGHTS_CONFIG_KEYS.includes(config.key)
            );
            
            const loadedConfig = {};
            
            if (insightsConfigs && insightsConfigs.length > 0) 
            {
                insightsConfigs.forEach(config => 
                {
                    if (config.key && config.value !== null) 
                    {
                        const localKey = config.key.replace('insights_', '');
                        
                        if (['dateRangeDays', 'maxBars'].includes(localKey)) 
                            loadedConfig[localKey] = parseInt(config.value);
                        else if (localKey === 'showWorkingTotals')
                            loadedConfig[localKey] = config.value === 'true';
                        else 
                            loadedConfig[localKey] = config.value;
                    }
                });
                
                setConfig(prevConfig => ({
                    ...prevConfig,
                    ...loadedConfig
                }));

                loggerService.logInfo(`Loaded insights configuration for owner: ${ownerId}`, loadedConfig);
            } 
            else
                loggerService.logInfo(`No insights configuration found for owner: ${ownerId}, using defaults`);

            const defaultConfig = {
                metric: 'shares',
                showWorkingTotals: false,
                orderSellColor: '#f44336',
                executedSellColor: '#e57373',
                orderBuyColor: '#528c74',
                executedBuyColor: '#81c784',
                workingBuyColor: '#66a7bb',
                workingSellColor: '#d9a9a7',
                dateMode: 'today',
                dateRangeDays: 10,
                maxBars: 5
            };
            updateAppliedStates({...defaultConfig, ...loadedConfig});
        } 
        catch (error) 
        {
            loggerService.logError(`Failed to load configuration: ${error.message}`);
        }
    }, [configurationService, ownerId, loggerService, updateAppliedStates]);

    const currentInsightType = useMemo(() =>
    {
        if (selectedTab === '1') return 'client';
        if (selectedTab === '2') return 'sector';
        if (selectedTab === '3') return 'country';
        if (selectedTab === '4') return 'instrument';
        return 'client';
    }, [selectedTab]);

    const extractMetricValues = useCallback((order, metric) =>
    {
        switch (metric)
        {
            case 'notionalUSD':
                return [safeDouble(order.orderNotionalValueInUSD), safeDouble(order.executedNotionalValueInUSD)];
            case 'notionalLocal':
                return [safeDouble(order.orderNotionalValueInLocal), safeDouble(order.executedNotionalValueInLocal)];
            case 'shares':
            default:
                return [safeDouble(order.quantity), safeDouble(order.executed)];
        }
    }, []);

    const convertOrdersToInsightItems = useCallback((orders, insightType, metric) =>
    {
        const grouping = new Map();
        for (const order of orders)
        {
            let name;
            switch (insightType.toLowerCase())
            {
                case 'client':
                    name = defaultIfBlank(order.clientCode || order.clientDescription, order.clientDescription);
                    break;
                case 'sector':
                    const sectorInstrument = instrumentService.getInstrumentByCode(order.instrumentCode);
                    name = defaultIfBlank(sectorInstrument?.sector, 'Unknown Sector');
                    break;
                case 'country':
                    const countryInstrument = instrumentService.getInstrumentByCode(order.instrumentCode);
                    name = defaultIfBlank(countryInstrument?.country, 'Unknown Country');
                    break;
                case 'instrument':
                    name = defaultIfBlank(order.instrumentCode || order.instrumentDescription, order.instrumentDescription);
                    break;
                default:
                    name = 'Unknown';
            }

            if (!grouping.has(name))
                grouping.set(name, {name: name, orderBuy: 0,  executedBuy: 0, orderSell: 0, executedSell: 0});

            const aggregated = grouping.get(name);
            const values = extractMetricValues(order, metric);
            const orderValue = values[0];
            const executedValue = values[1];
            const side = order.side;

            if (side.toUpperCase() === 'BUY')
            {
                aggregated.orderBuy += orderValue;
                aggregated.executedBuy += executedValue;
            }
            else
            {
                aggregated.orderSell -= orderValue;
                aggregated.executedSell -= executedValue;
            }
        }

        return Array.from(grouping.values());
    }, [instrumentService]);

    const convertApiDataToInsightItems = useCallback((apiData, insightType) =>
    {
        const grouping = new Map();
        for (const item of apiData)
        {
            let name;
            switch (insightType.toLowerCase())
            {
                case 'client':
                    name = defaultIfBlank(item.name, 'Unknown Client');
                    break;
                case 'sector':
                    name = defaultIfBlank(item.name, 'Unknown Sector');
                    break;
                case 'country':
                    name = defaultIfBlank(item.name, 'Unknown Country');
                    break;
                case 'instrument':
                    name = defaultIfBlank(item.name, 'Unknown Instrument');
                    break;
                default:
                    name = 'Unknown';
            }

            if (!grouping.has(name))
                grouping.set(name, {name: name, orderBuy: 0, executedBuy: 0, orderSell: 0, executedSell: 0});

            const aggregated = grouping.get(name);
            aggregated.orderBuy += item.orderBuy || 0;
            aggregated.executedBuy += item.executedBuy || 0;
            aggregated.orderSell += item.orderSell || 0;
            aggregated.executedSell += item.executedSell || 0;
        }

        return Array.from(grouping.values());
    }, [instrumentService]);

    useEffect(() =>
    {
        const webWorker = new Worker(new URL("../workers/insights-reader.js", import.meta.url));
        setInboundWorker(webWorker);
        return () => webWorker.terminate();
    }, []);

    const handleWorkerMessage = useCallback((event) =>
    {
        const incomingOrder = event.data.order;
        if (incomingOrder)
        {
            setOrders(prevOrders => 
            {
                const existingOrderIndex = prevOrders.findIndex(order =>  order.orderId === incomingOrder.orderId);                
                if (existingOrderIndex !== -1) 
                {
                    const newOrders = [...prevOrders];
                    newOrders[existingOrderIndex] = incomingOrder;
                    return newOrders;
                }
                else
                    return [...prevOrders, incomingOrder];
            });
        }
    }, []);

    useEffect(() =>
    {
        if (inboundWorker)
            inboundWorker.onmessage = handleWorkerMessage;

        return () =>
        {
            if (inboundWorker)
                inboundWorker.onmessage = null;
        };
    }, [inboundWorker]);

    const openConfig = useCallback(() =>
    {
        setIsConfigOpen(true);
    }, []);

    const closeConfig = useCallback(() => setIsConfigOpen(false), []);

    const applyConfig = useCallback(async (newConfig) =>
    {
        try 
        {
            setConfig(newConfig);
            updateAppliedStates(newConfig);
            setIsConfigOpen(false);
            const insightsConfigToSave = {};

            INSIGHTS_CONFIG_KEYS.forEach(key =>
            {
                const localKey = key.replace('insights_', '');
                if (newConfig[localKey] !== undefined) {
                    insightsConfigToSave[key] = newConfig[localKey];
                }
            });

            await configurationService.saveOrUpdateConfigurations(ownerId, insightsConfigToSave);
            loggerService.logInfo(`Successfully applied insights configuration for owner: ${ownerId}`, insightsConfigToSave);
        } 
        catch (error) 
        {
            loggerService.logError(`Failed to apply configuration: ${error.message}`);
        }
    }, [configurationService, ownerId, loggerService, updateAppliedStates]);

    useEffect(() =>
    {
        const loadData = async () =>
        {
            await loadConfiguration();
        };
        loadData().then(() => loggerService.logInfo("Configuration loaded in InsightsApp"));
    }, [loadConfiguration, loggerService]);

    useEffect(() =>
    {
        const loadData = async () =>
        {
            try
            {
                if (appliedDateMode === 'today')
                {
                    setInsightsData([]);
                    if (orders.length > 0)
                    {
                        const insightsFromOrders = convertOrdersToInsightItems(orders, currentInsightType, appliedMetric);
                        setInsightsData(insightsFromOrders);
                    }
                    return;
                }

                const startDate = getDateMinusDays(appliedDateRangeDays);
                const endDate = new Date().toISOString().split('T')[0];
                const query = new URLSearchParams({insightType: currentInsightType, metric: appliedMetric, startDate, endDate}).toString();
                const url = `http://localhost:20013/orders/insights?${query}`;
                loggerService.logInfo(`Fetching insights using URL: ${url}`);
                const response = await fetch(url);
                if (!response.ok) throw new Error('Network response was not ok');
                const data = await response.json();
                const processedData = Array.isArray(data) ? convertApiDataToInsightItems(data, currentInsightType) : [];
                setInsightsData(processedData);
            }
            catch (error)
            {
                loggerService.logError(`Failed to load insights data: ${error.message}`);
                setInsightsData([]);
            }
        };

        loadData().then(() => loggerService.logInfo("Insights data loaded successfully."));
    }, [currentInsightType, appliedDateMode, appliedMetric, appliedDateRangeDays, orders, loggerService, convertApiDataToInsightItems]);

    const displayedInsightsData = useMemo(() =>
    {
        const limit = Math.max(1, Number(appliedMaxBars) || 1);
        if (!Array.isArray(insightsData)) return [];
        if (insightsData.length <= limit) return insightsData;
        return insightsData.slice(0, limit);
    }, [insightsData, appliedMaxBars]);

    const titleSuffix = useMemo(() =>
    {
        let metricText = 'Shares';
        if (appliedMetric === 'notionalUSD') metricText = 'Notional value in USD';
        else if (appliedMetric === 'notionalLocal') metricText = 'Notional value in local currency';
        const dateText = appliedDateMode === 'today' ? 'for today' : `for the last ${appliedDateRangeDays} days`;
        return ` - ${metricText} ${dateText}`;

    }, [appliedMetric, appliedDateMode, appliedDateRangeDays]);

    return (
        <>
            <TitleBarComponent title="Insights" windowId={windowId} addButtonProps={undefined}  showChannel={true} showTools={false} showConfig={{ handler: openConfig}}/>
            <div className="insights-app" style={{width: '100%', height: 'calc(100vh - 131px)', float: 'left', padding: '0px', margin:'45px 0px 0px 0px'}}>
                <TabContext value={selectedTab}>
                    <TabList className="insights-tab-list" onChange={(event, newValue) => setSelectedTab(newValue)}>
                        <Tab className="client-insights-tab" label={"Clients"} value="1" sx={{ marginRight: "5px",  minHeight: "25px", height: "25px", backgroundColor: "#bdbaba", color: "white", '&.Mui-selected': {backgroundColor: '#656161',  color: "white"}}}/>
                        <Tab className="sector-insights-tab" label={"Sectors"} value="2"  sx={{ minHeight: "25px", height: "25px", backgroundColor: "#bdbaba", color: "white", '&.Mui-selected': {backgroundColor: '#656161', color: "white"}}}/>
                        <Tab className="country-insights-tab" label={"Countries"} value="3"  sx={{ minHeight: "25px", height: "25px", backgroundColor: "#bdbaba", color: "white", '&.Mui-selected': {backgroundColor: '#656161', color: "white"}}}/>
                        <Tab className="instrument-insights-tab" label={"Instruments"} value="4"  sx={{ minHeight: "25px", height: "25px", backgroundColor: "#bdbaba", color: "white", '&.Mui-selected': {backgroundColor: '#656161', color: "white"}}}/>
                    </TabList>
                    {selectedTab === "1" && (
                        <TabPanel value="1" className="client-insights" sx={{ padding: 0, margin: 0 }}>
                            <HorizontalBarChartComponent title={`Client Insights${titleSuffix}`} data={displayedInsightsData} colors={appliedColors} metric={appliedMetric} showWorkingTotals={appliedShowWorkingTotals} />
                        </TabPanel>
                    )}
                    {selectedTab === "2" && (
                        <TabPanel value="2" className="sector-insights" sx={{ padding: 0, margin: 0 }}>
                            <HorizontalBarChartComponent title={`Sector Insights${titleSuffix}`} data={displayedInsightsData} colors={appliedColors} metric={appliedMetric} showWorkingTotals={appliedShowWorkingTotals} />
                        </TabPanel>
                    )}
                    {selectedTab === "3" && (
                        <TabPanel value="3" className="country-insights" sx={{ padding: 0, margin: 0 }}>
                            <HorizontalBarChartComponent title={`Country Insights${titleSuffix}`} data={displayedInsightsData} colors={appliedColors} metric={appliedMetric} showWorkingTotals={appliedShowWorkingTotals} />
                        </TabPanel>
                    )}
                    {selectedTab === "4" && (
                        <TabPanel value="4" className="instrument-insights" sx={{ padding: 0, margin: 0 }}>
                            <HorizontalBarChartComponent title={`Instrument Insights${titleSuffix}`} data={displayedInsightsData} colors={appliedColors} metric={appliedMetric} showWorkingTotals={appliedShowWorkingTotals} />
                        </TabPanel>
                    )}
                </TabContext>
                <InsightsConfigPanel isOpen={isConfigOpen} config={config} onClose={closeConfig} onApply={applyConfig} />
            </div>
        </>
    );
}
