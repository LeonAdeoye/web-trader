import React, {useState, useMemo, useEffect, useRef, useCallback} from 'react';
import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-balham.css';
import { TabContext, TabList, TabPanel } from '@mui/lab';
import '../styles/css/main.css';
import {Tab} from "@mui/material";
import TitleBarComponent from "../components/TitleBarComponent";
import {LoggerService} from "../services/LoggerService";

const InsightsApp = () =>
{
    const loggerService = useRef(new LoggerService(InsightsApp.name)).current;
    const windowId = useMemo(() => window.command.getWindowId("Insights"), []);
    const [selectedTab, setSelectedTab] = useState("1");

    return (
        <>
            <TitleBarComponent title="Insights" windowId={windowId} addButtonProps={null}  showChannel={true} showTools={false}/>
            <div className="insights-app" style={{width: '100%', height: 'calc(100vh - 67px)', float: 'left', padding: '0px', margin:'45px 0px 0px 0px'}}>
                <TabContext value={selectedTab}>
                    <TabList className="insights-tab-list" onChange={(event, newValue) => setSelectedTab(newValue)} aria-label="Trade History Tabs">
                        <Tab className="client-insights-tab" label={"Clients"} value="1" sx={{ marginRight: "5px",  minHeight: "25px", height: "25px", backgroundColor: "#bdbaba", color: "white", '&.Mui-selected': {backgroundColor: '#656161',  color: "white"}}}/>
                        <Tab className="sector-insights-tab" label={"Sector"} value="2"  sx={{ minHeight: "25px", height: "25px", backgroundColor: "#bdbaba", color: "white", '&.Mui-selected': {backgroundColor: '#656161', color: "white"}}}/>
                        <Tab className="country-insights-tab" label={"Country"} value="3"  sx={{ minHeight: "25px", height: "25px", backgroundColor: "#bdbaba", color: "white", '&.Mui-selected': {backgroundColor: '#656161', color: "white"}}}/>
                        <Tab className="instrument-insights-tab" label={"Instruments"} value="3"  sx={{ minHeight: "25px", height: "25px", backgroundColor: "#bdbaba", color: "white", '&.Mui-selected': {backgroundColor: '#656161', color: "white"}}}/>
                    </TabList>

                    {selectedTab === "1" && (
                        <TabPanel value="1" className="client-insights">
                        </TabPanel>)}

                    {selectedTab === "2" && (
                        <TabPanel value="2" className="sector-insights">
                        </TabPanel>)}

                    {selectedTab === "3" && (
                        <TabPanel value="3" className="country-insights">
                        </TabPanel>)}

                    {selectedTab === "4" && (
                        <TabPanel value="4" className="instrument-insights">
                        </TabPanel>)}

                </TabContext>
            </div>
        </>
    );
}

export default InsightsApp;
