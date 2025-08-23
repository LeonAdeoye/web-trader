import TitleBarComponent from "../components/TitleBarComponent";
import {useState, useMemo} from "react";
import * as React from 'react';
import {TabContext, TabList, TabPanel} from "@mui/lab";
import {Box, Tab} from "@mui/material";
import TraderNotionalGridComponent from "../components/TraderNotionalGridComponent";
import DeskNotionalGridComponent from "../components/DeskNotionalGridComponent";
import NotionalBreachesGridComponent from "../components/NotionalBreachesGridComponent";
import NotionalLimitsGridComponent from "../components/NotionalLimitsGridComponent";
import ADVLimitsGridComponent from "../components/ADVLimitsGridComponent";
import QuantityLimitsGridComponent from "../components/QuantityLimitsGridComponent";
import PriceLimitsGridComponent from "../components/PriceLimitsGridComponent";

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
                            <Tab className="notional-limits-tab" label={"Notional Limits"} value="1"  sx={{ minHeight: "25px", height: "25px", backgroundColor: "#bdbaba", color: "white", '&.Mui-selected': {backgroundColor: '#656161', color: "white"}}}/>
                            <Tab className="desk-notionals-tab" label={"Desk Notionals"} value="2" sx={{ marginRight: "5px",  minHeight: "25px", height: "25px", backgroundColor: "#bdbaba", color: "white", '&.Mui-selected': {backgroundColor: '#656161',  color: "white"}}}/>
                            <Tab className="trader-notionals-tab" label={"Trader Notionals"} value="3"  sx={{ minHeight: "25px", height: "25px", backgroundColor: "#bdbaba", color: "white", '&.Mui-selected': {backgroundColor: '#656161', color: "white"}}}/>
                            <Tab className="notional-breaches-tab" label={"Notional Breaches"} value="4"  sx={{ minHeight: "25px", height: "25px", backgroundColor: "#bdbaba", color: "white", '&.Mui-selected': {backgroundColor: '#656161', color: "white"}}}/>
                            <Tab className="price-limits-tab" label={"Price Limits"} value="5"  sx={{ minHeight: "25px", height: "25px", backgroundColor: "#bdbaba", color: "white", '&.Mui-selected': {backgroundColor: '#656161', color: "white"}}}/>
                            <Tab className="price-breaches-tab" label={"Price Breaches"} value="6"  sx={{ minHeight: "25px", height: "25px", backgroundColor: "#bdbaba", color: "white", '&.Mui-selected': {backgroundColor: '#656161', color: "white"}}}/>
                            <Tab className="quantity-limits-tab" label={"Quantity Limits"} value="7"  sx={{ minHeight: "25px", height: "25px", backgroundColor: "#bdbaba", color: "white", '&.Mui-selected': {backgroundColor: '#656161', color: "white"}}}/>
                            <Tab className="quantity-breaches-tab" label={"Quantity Breaches"} value="8"  sx={{ minHeight: "25px", height: "25px", backgroundColor: "#bdbaba", color: "white", '&.Mui-selected': {backgroundColor: '#656161', color: "white"}}}/>
                            <Tab className="adv-limits-tab" label={"ADV% Limits"} value="9"  sx={{ minHeight: "25px", height: "25px", backgroundColor: "#bdbaba", color: "white", '&.Mui-selected': {backgroundColor: '#656161', color: "white"}}}/>
                            <Tab className="adv-breaches-tab" label={"ADV% Breaches"} value="10"  sx={{ minHeight: "25px", height: "25px", backgroundColor: "#bdbaba", color: "white", '&.Mui-selected': {backgroundColor: '#656161', color: "white"}}}/>
                        </TabList>
                    </Box>
                    <TabPanel value='1' className="notional-limits">
                        <NotionalLimitsGridComponent/>
                    </TabPanel>
                    <TabPanel value='2' className="desk-notionals">
                        <DeskNotionalGridComponent/>
                    </TabPanel>
                    <TabPanel value='3' className="trader-notionals">
                        <TraderNotionalGridComponent/>
                    </TabPanel>
                    <TabPanel value='4' className="notional-breaches">
                        <NotionalBreachesGridComponent/>
                    </TabPanel>
                    <TabPanel value='5' className="price-limits">
                        <PriceLimitsGridComponent/>
                    </TabPanel>
                    <TabPanel value='6' className="price-breaches">
                        {/* <PriceBreachesGridComponent/> */}
                    </TabPanel>
                    <TabPanel value='7' className="quantity-limits">
                        <QuantityLimitsGridComponent/>
                    </TabPanel>
                    <TabPanel value='8' className="quantity-breaches">
                        {/* <QuantityBreachesGridComponent/> */}
                    </TabPanel>
                    <TabPanel value='9' className="adv-limits">
                        <ADVLimitsGridComponent/>
                    </TabPanel>
                    <TabPanel value='10' className="adv-breaches">
                        {/* <ADVBreachesGridComponent/> */}
                    </TabPanel>
                </TabContext>
            </div>
        </div>
    </>)
}
