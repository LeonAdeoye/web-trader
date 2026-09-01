import TitleBarComponent from "../components/TitleBarComponent";
import {useState, useMemo} from "react";
import * as React from 'react';
import {TabContext, TabList, TabPanel} from "@mui/lab";
import {Box, Tab} from "@mui/material";
import TraderNotionalGridComponent from "../components/TraderNotionalGridComponent";
import DeskNotionalGridComponent from "../components/DeskNotionalGridComponent";
import NotionalBreachesGridComponent from "../components/NotionalBreachesGridComponent";
import NotionalLimitsGridComponent from "../components/NotionalLimitsGridComponent";
import TraderNotionalLimitsGridComponent from "../components/TraderNotionalLimitsGridComponent";
import ADVLimitsGridComponent from "../components/ADVLimitsGridComponent";
import QuantityLimitsGridComponent from "../components/QuantityLimitsGridComponent";
import PriceLimitsGridComponent from "../components/PriceLimitsGridComponent";
import PriceBreachesGridComponent from "../components/PriceBreachesGridComponent";
import QuantityBreachesGridComponent from "../components/QuantityBreachesGridComponent";
import ADVBreachesGridComponent from "../components/ADVBreachesGridComponent";

const tabSx = {minHeight: "25px", height: "25px", textTransform: "none", borderTopLeftRadius: "8px", borderTopRightRadius: "8px", backgroundColor: "#bdbaba", color: "white", "&.Mui-selected": {backgroundColor: "#656161", color: "white"}};
const tabPanelSx = {padding: 0, margin: 0};

export const LimitsApp = () =>
{
    const windowId = useMemo(() => window.command.getWindowId("Limits"), []);
    const [selectedTab, setSelectedTab] = useState("1");

    return (
    <>
        <TitleBarComponent title="Limits" windowId={windowId} addButtonProps={undefined} showChannel={true} showTools={false}/>
        <div style={{ width: '100%', height: 'calc(100vh - 65px)', float: 'left', padding: '0px', margin:'45px 0px 0px 0px'}}>
            <div className="limits-app">
                <TabContext value={selectedTab}>
                    <Box>
                        <TabList className="limits-tab-list" onChange={(event, newValue) => setSelectedTab(newValue)} TabIndicatorProps={{style: {display: "none"}}}>
                            <Tab className="desk-notional-limits-tab" label={"Desk Notional Limit"} value="1" sx={tabSx}/>
                            <Tab className="trader-notional-limits-tab" label={"Trader Notional Limit"} value="2" sx={tabSx}/>
                            <Tab className="desk-notionals-tab" label={"Desk Notionals"} value="3" sx={tabSx}/>
                            <Tab className="trader-notionals-tab" label={"Trader Notionals"} value="4" sx={tabSx}/>
                            <Tab className="notional-breaches-tab" label={"Notional Breaches"} value="5" sx={tabSx}/>
                            <Tab className="price-limits-tab" label={"Price Difference % Limits"} value="6" sx={tabSx}/>
                            <Tab className="price-breaches-tab" label={"Price Breaches"} value="7" sx={tabSx}/>
                            <Tab className="quantity-limits-tab" label={"Quantity Limits"} value="8" sx={tabSx}/>
                            <Tab className="quantity-breaches-tab" label={"Quantity Breaches"} value="9" sx={tabSx}/>
                            <Tab className="adv-limits-tab" label={"ADV % Limits"} value="10" sx={tabSx}/>
                            <Tab className="adv-breaches-tab" label={"ADV% Breaches"} value="11" sx={tabSx}/>
                        </TabList>
                    </Box>
                    <TabPanel value='1' className="desk-notional-limits" sx={tabPanelSx}>
                        <NotionalLimitsGridComponent/>
                    </TabPanel>
                    <TabPanel value='2' className="trader-notional-limits" sx={tabPanelSx}>
                        <TraderNotionalLimitsGridComponent/>
                    </TabPanel>
                    <TabPanel value='3' className="desk-notionals" sx={tabPanelSx}>
                        <DeskNotionalGridComponent/>
                    </TabPanel>
                    <TabPanel value='4' className="trader-notionals" sx={tabPanelSx}>
                        <TraderNotionalGridComponent/>
                    </TabPanel>
                    <TabPanel value='5' className="notional-breaches" sx={tabPanelSx}>
                        <NotionalBreachesGridComponent/>
                    </TabPanel>
                    <TabPanel value='6' className="price-limits" sx={tabPanelSx}>
                        <PriceLimitsGridComponent/>
                    </TabPanel>
                    <TabPanel value='7' className="price-breaches" sx={tabPanelSx}>
                        <PriceBreachesGridComponent/>
                    </TabPanel>
                    <TabPanel value='8' className="quantity-limits" sx={tabPanelSx}>
                        <QuantityLimitsGridComponent/>
                    </TabPanel>
                    <TabPanel value='9' className="quantity-breaches" sx={tabPanelSx}>
                        <QuantityBreachesGridComponent/>
                    </TabPanel>
                    <TabPanel value='10' className="adv-limits" sx={tabPanelSx}>
                        <ADVLimitsGridComponent/>
                    </TabPanel>
                    <TabPanel value='11' className="adv-breaches" sx={tabPanelSx}>
                        <ADVBreachesGridComponent/>
                    </TabPanel>
                </TabContext>
            </div>
        </div>
    </>)
}
