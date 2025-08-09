import React, {useState, useMemo, useRef, useCallback, useEffect} from 'react';
import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-balham.css';
import { TabContext, TabList, TabPanel } from '@mui/lab';
import '../styles/css/main.css';
import {Tab} from "@mui/material";
import TitleBarComponent from "../components/TitleBarComponent";
import {LoggerService} from "../services/LoggerService";
import {HorizontalBarChartComponent} from "../components/HorizontalBarChartComponent";
import { getDateMinusDays } from "../utilities";
import { useRecoilState } from 'recoil';
import { insightsConfigPanelOpenState } from '../atoms/component-state';
import InsightsConfigPanel from "../components/InsightsConfigPanel";

export const InsightsApp = () =>
{
    const loggerService = useRef(new LoggerService(InsightsApp.name)).current;
    const windowId = useMemo(() => window.command.getWindowId("Insights"), []);
    const [selectedTab, setSelectedTab] = useState("1");
    const [isConfigOpen, setIsConfigOpen] = useRecoilState(insightsConfigPanelOpenState);
    const [appliedShowWorkingTotals, setAppliedShowWorkingTotals] = useState(false);
    const [appliedMetric, setAppliedMetric] = useState('notionalUSD');
    const [appliedDateMode, setAppliedDateMode] = useState('today');
    const [appliedDateRangeDays, setAppliedDateRangeDays] = useState(10);
    const [appliedMaxBars, setAppliedMaxBars] = useState(5);
    const [insightsData, setInsightsData] = useState([]);

    const [config, setConfig] = useState({
        metric: 'notionalUSD',
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

    const currentInsightType = useMemo(() => {
        if (selectedTab === '1') return 'client';
        if (selectedTab === '2') return 'sector';
        if (selectedTab === '3') return 'country';
        if (selectedTab === '4') return 'instrument';
        return 'client';
    }, [selectedTab]);

    const generateDummyData = (categoryType) =>
    {
        const categories = {
            client: ['Client A', 'Client B', 'Client C', 'Client D', 'Client E'],
            sector: ['Tech', 'Finance', 'Healthcare', 'Energy', 'Retail'],
            country: ['USA', 'UK', 'Germany', 'Japan', 'India'],
            instrument: ['Stock X', 'Stock Y', 'Stock Z', 'Stock W', 'Stock V']
        };

        return categories[categoryType].map(name =>
        {
            const orderBuy = Math.floor(Math.random() * 1000) + 500;
            const executedBuy = Math.floor(orderBuy * Math.random());
            const orderSell = -1 * (Math.floor(Math.random() * 1000) + 500);
            const executedSell = -1 * Math.floor(Math.abs(orderSell) * Math.random());

            return { name, orderBuy, executedBuy, orderSell, executedSell };
        });
    };

    const openConfig = useCallback(() =>
    {
        loggerService.logInfo("Opening Insights configuration.");
        setIsConfigOpen(true);
    }, []);

    const closeConfig = useCallback(() => setIsConfigOpen(false), []);

    const applyConfig = useCallback(() =>
    {
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
        loggerService.logInfo(`Applied Insights config: ${JSON.stringify(config)}`);
        setIsConfigOpen(false);
    }, [config]);

    useEffect(() =>
    {
        const loadData = async () =>
        {
            try
            {
                if (appliedDateMode === 'today')
                {
                    const generated = generateDummyData(currentInsightType);
                    setInsightsData(generated);
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
                setInsightsData(Array.isArray(data) ? data : []);
            }
            catch (error)
            {
                loggerService.logError("Failed to fetch insights: " + error);
                setInsightsData(generateDummyData(currentInsightType));
            }
        };

        loadData().then(() => loggerService.logInfo("Insights data loaded successfully."));
    }, [currentInsightType, appliedDateMode, appliedMetric, appliedDateRangeDays, loggerService]);

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

        const dateText = appliedDateMode === 'today'
            ? 'for today'
            : `for the last ${appliedDateRangeDays} days`;

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
                <InsightsConfigPanel isOpen={isConfigOpen} config={config} onChange={(next) => setConfig(next)} onClose={closeConfig} onApply={applyConfig} />
            </div>
        </>
    );
}
