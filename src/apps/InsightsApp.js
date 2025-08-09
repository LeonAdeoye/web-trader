import React, {useState, useMemo, useRef, useCallback} from 'react';
import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-balham.css';
import { TabContext, TabList, TabPanel } from '@mui/lab';
import '../styles/css/main.css';
import {Tab} from "@mui/material";
import TitleBarComponent from "../components/TitleBarComponent";
import {LoggerService} from "../services/LoggerService";
import {HorizontalBarChartComponent} from "../components/HorizontalBarChartComponent";
import { useRecoilState } from 'recoil';
import { insightsConfigPanelOpenState } from '../atoms/component-state';
import InsightsConfigPanel from "../components/InsightsConfigPanel";

export const InsightsApp = () =>
{
    const loggerService = useRef(new LoggerService(InsightsApp.name)).current;
    const windowId = useMemo(() => window.command.getWindowId("Insights"), []);
    const [selectedTab, setSelectedTab] = useState("1");

    // Panel visibility and config state
    const [isConfigOpen, setIsConfigOpen] = useRecoilState(insightsConfigPanelOpenState);
    const [config, setConfig] = useState({
        metric: 'shares',
        showWorkingTotals: false,
        orderBuyColor: '#2e7d32',
        orderSellColor: '#c62828',
        executedBuyColor: '#1b5e20',
        executedSellColor: '#945050',
        workingBuyColor: '#8669b0',
        workingSellColor: '#ef7550',
        dateMode: 'today',
        dateRangeDays: 10
    });

    // Applied settings (only updated on Apply)
    const [appliedColors, setAppliedColors] = useState({
        orderSellColor: '#f44336',
        executedSellColor: '#e57373',
        orderBuyColor: '#528c74',
        executedBuyColor: '#81c784',
        workingBuyColor: '#66bb6a',
        workingSellColor: '#ef5350'
    });
    const [appliedShowWorkingTotals, setAppliedShowWorkingTotals] = useState(false);

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
        // Apply colors and working totals toggle to charts and close panel
        setAppliedColors({
            orderSellColor: config.orderSellColor,
            executedSellColor: config.executedSellColor,
            orderBuyColor: config.orderBuyColor,
            executedBuyColor: config.executedBuyColor,
            workingBuyColor: config.workingBuyColor,
            workingSellColor: config.workingSellColor
        });
        setAppliedShowWorkingTotals(config.showWorkingTotals === true);
        loggerService.logInfo(`Applied Insights config: ${JSON.stringify(config)}`);
        setIsConfigOpen(false);
    }, [config]);

    return (
        <>
            <TitleBarComponent title="Insights" windowId={windowId} addButtonProps={undefined}  showChannel={true} showTools={false} showConfig={{ handler: openConfig}}/>
            <div className="insights-app" style={{width: '100%', height: 'calc(100vh - 131px)', float: 'left', padding: '0px', margin:'45px 0px 0px 0px'}}>
                <TabContext value={selectedTab}>
                    <TabList className="insights-tab-list" onChange={(event, newValue) => setSelectedTab(newValue)}>
                        <Tab className="client-insights-tab" label={"Clients"} value="1" sx={{ marginRight: "5px",  minHeight: "25px", height: "25px", backgroundColor: "#bdbaba", color: "white", '&.Mui-selected': {backgroundColor: '#656161',  color: "white"}}}/>
                        <Tab className="sector-insights-tab" label={"Sector"} value="2"  sx={{ minHeight: "25px", height: "25px", backgroundColor: "#bdbaba", color: "white", '&.Mui-selected': {backgroundColor: '#656161', color: "white"}}}/>
                        <Tab className="country-insights-tab" label={"Country"} value="3"  sx={{ minHeight: "25px", height: "25px", backgroundColor: "#bdbaba", color: "white", '&.Mui-selected': {backgroundColor: '#656161', color: "white"}}}/>
                        <Tab className="instrument-insights-tab" label={"Top 10 Instruments"} value="4"  sx={{ minHeight: "25px", height: "25px", backgroundColor: "#bdbaba", color: "white", '&.Mui-selected': {backgroundColor: '#656161', color: "white"}}}/>
                    </TabList>
                    {selectedTab === "1" && (
                        <TabPanel value="1" className="client-insights" sx={{ padding: 0, margin: 0 }}>
                            <HorizontalBarChartComponent title="Client Insights" data={generateDummyData('client')} colors={appliedColors} showWorkingTotals={appliedShowWorkingTotals} />
                        </TabPanel>
                    )}
                    {selectedTab === "2" && (
                        <TabPanel value="2" className="sector-insights" sx={{ padding: 0, margin: 0 }}>
                            <HorizontalBarChartComponent title="Sector Insights" data={generateDummyData('sector')} colors={appliedColors} showWorkingTotals={appliedShowWorkingTotals} />
                        </TabPanel>
                    )}
                    {selectedTab === "3" && (
                        <TabPanel value="3" className="country-insights" sx={{ padding: 0, margin: 0 }}>
                            <HorizontalBarChartComponent title="Country Insights" data={generateDummyData('country')} colors={appliedColors} showWorkingTotals={appliedShowWorkingTotals} />
                        </TabPanel>
                    )}
                    {selectedTab === "4" && (
                        <TabPanel value="4" className="instrument-insights" sx={{ padding: 0, margin: 0 }}>
                            <HorizontalBarChartComponent title="Instrument Insights" data={generateDummyData('instrument')} colors={appliedColors} showWorkingTotals={appliedShowWorkingTotals} />
                        </TabPanel>
                    )}
                </TabContext>

                <InsightsConfigPanel
                    isOpen={isConfigOpen}
                    config={config}
                    onChange={(next) => setConfig(next)}
                    onClose={closeConfig}
                    onApply={applyConfig}
                />
            </div>
        </>
    );
}
