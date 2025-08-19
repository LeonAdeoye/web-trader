import TitleBarComponent from "../components/TitleBarComponent";
import {useState, useMemo} from "react";
import * as React from 'react';
import {TabContext, TabList, TabPanel} from "@mui/lab";
import {Box, Tab} from "@mui/material";
import TraderNotionalGridComponent from "../components/TraderNotionalGridComponent";
import DeskNotionalGridComponent from "../components/DeskNotionalGridComponent";
import NotionalBreachesGridComponent from "../components/NotionalBreachesGridComponent";

export const LimitsApp = () =>
{
    const windowId = useMemo(() => window.command.getWindowId("Limits"), []);
    const [selectedTab, setSelectedTab] = useState("1");

    return (
    <>
        <TitleBarComponent title="Limits" windowId={windowId} addButtonProps={undefined} showChannel={true} showTools={false}/>
        <div style={{ width: '100%', height: 'calc(100vh - 95px)', float: 'left', padding: '0px', margin:'45px 0px 0px 0px'}}>
            <div className="limits-app">
                <TabContext value={selectedTab}>
                    <Box>
                        <TabList className="limits-tab-list" onChange={(event, newValue) => setSelectedTab(newValue)}>
                            <Tab className="desk-notionals-tab" label={"Desk Notionals"} value="1" sx={{ marginRight: "5px",  minHeight: "25px", height: "25px", backgroundColor: "#bdbaba", color: "white", '&.Mui-selected': {backgroundColor: '#656161',  color: "white"}}}/>
                            <Tab className="trader-notionals-tab" label={"Trader Notionals"} value="2"  sx={{ minHeight: "25px", height: "25px", backgroundColor: "#bdbaba", color: "white", '&.Mui-selected': {backgroundColor: '#656161', color: "white"}}}/>
                            <Tab className="notional-breaches-tab" label={"Notional Breaches"} value="3"  sx={{ minHeight: "25px", height: "25px", backgroundColor: "#bdbaba", color: "white", '&.Mui-selected': {backgroundColor: '#656161', color: "white"}}}/>
                        </TabList>
                    </Box>
                    <TabPanel value='1' className="desk-notionals">
                        <DeskNotionalGridComponent/>
                    </TabPanel>
                    <TabPanel value='2' className="trader-notionals">
                        <TraderNotionalGridComponent/>
                    </TabPanel>
                    <TabPanel value='3' className="notional-breaches">
                        <NotionalBreachesGridComponent/>
                    </TabPanel>
                </TabContext>
            </div>
        </div>
    </>)
}
