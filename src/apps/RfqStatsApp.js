import React, { useState, useMemo } from 'react';
import { TabContext, TabList, TabPanel } from "@mui/lab";
import { Tab } from "@mui/material";
import TitleBarComponent from "../components/TitleBarComponent";
import TodayStatsComponent from "../components/TodayStatsComponent";
import ClientPerformanceComponent from "../components/ClientPerformanceComponent";
import DailyTrendsComponent from "../components/DailyTrendsComponent";
import InstrumentAnalysisComponent from "../components/InstrumentAnalysisComponent";
import ClientStatusComponent from "../components/ClientStatusComponent";
import '../styles/css/rfq-stats.css';

export const RfqStatsApp = () =>
{
    const windowId = useMemo(() => window.command.getWindowId("RFQ Stats"), []);
    const [selectedTab, setSelectedTab] = useState("1");

    return (
        <>
            <TitleBarComponent 
                title="Request For Quote Statistics"
                windowId={windowId} 
                addButtonProps={undefined} 
                showChannel={false} 
                showTools={false} />
            
            <div className="reference-app" style={{width: '100%', height: 'calc(100vh - 93px)', float: 'left', padding: '0px', margin:'45px 0px 0px 0px'}}>
                <TabContext value={selectedTab}>
                    <TabList className="reference-tab-list" onChange={(event, newValue) => setSelectedTab(newValue)}>
                        <Tab className="today-summary-tab" label="Today's Statistics" value="1" />
                        <Tab className="client-performance-tab" label="Client Statistics" value="2" />
                        <Tab className="daily-trends-tab" label="Daily Statistics" value="3" />
                        <Tab className="instrument-analysis-tab" label="Instrument Status" value="4" />
                        <Tab className="client-status-tab" label="Client Status" value="5" />
                    </TabList>
                    
                    <TabPanel value="1" className="today-stats-ref-data">
                        <TodayStatsComponent />
                    </TabPanel>
                    
                    <TabPanel value="2" className="client-performance-ref-data">
                        <ClientPerformanceComponent />
                    </TabPanel>
                    
                    <TabPanel value="3" className="daily-trends-ref-data">
                        <DailyTrendsComponent />
                    </TabPanel>
                    
                    <TabPanel value="4" className="instrument-analysis-ref-data">
                        <InstrumentAnalysisComponent />
                    </TabPanel>
                    
                    <TabPanel value="5" className="client-status-ref-data">
                        <ClientStatusComponent />
                    </TabPanel>
                </TabContext>
            </div>
        </>
    );
};

export default RfqStatsApp;
