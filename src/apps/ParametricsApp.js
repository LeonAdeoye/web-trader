import {useMemo, useState} from "react";
import TitleBarComponent from "../components/TitleBarComponent";
import {TabContext, TabList, TabPanel} from "@mui/lab";
import {Box, Tab} from "@mui/material";
import {InterestRateParametricComponent} from "../components/InterestRateParametricComponent";
import {VolatilityParametricComponent} from "../components/VolatilityParametricComponent";
import {PriceParametricComponent} from "../components/PriceParametricComponent";

export const ParametricsApp = () =>
{
    const windowId = useMemo(() => window.command.getWindowId("Parametrics"), []);
    const [selectedTab, setSelectedTab] = useState("1");

    return (
        <>
            <TitleBarComponent title="Parametrics" windowId={windowId} addButtonProps={undefined} showChannel={true} showTools={false}/>
            <div style={{ width: '100%', height: 'calc(100vh - 95px)', float: 'left', padding: '0px', margin:'45px 0px 0px 0px'}}>
                <div className="parametric-app">
                    <TabContext value={selectedTab}>
                        <Box>
                            <TabList className="parametric-tab-list" onChange={(event, newValue) => setSelectedTab(newValue)}>
                                <Tab className="volatility-parametric-tab" label={"Volatility"} value="1"/>
                                <Tab className="interest-rate-parametric-tab" label={"Interest Rate"} value="2"/>
                                <Tab className="price-parametric-tab" label={"Prices"} value="3"/>
                            </TabList>
                        </Box>
                        <TabPanel value='1' className="volatility-parametric">
                            <VolatilityParametricComponent/>
                        </TabPanel>
                        <TabPanel value='2' className="interest-rate-parametric">
                            <InterestRateParametricComponent/>
                        </TabPanel>
                        <TabPanel value='3' className="price-parametric">
                            <PriceParametricComponent/>
                        </TabPanel>
                    </TabContext>
                </div>
            </div>
        </>);
}
