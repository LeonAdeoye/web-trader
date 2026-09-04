import {useMemo, useState} from "react";
import TitleBarComponent from "../components/TitleBarComponent";
import {TabContext, TabList, TabPanel} from "@mui/lab";
import {Box, Tab} from "@mui/material";
import {useSetRecoilState} from "recoil";
import {InterestRateParametricComponent} from "../components/InterestRateParametricComponent";
import {VolatilityParametricComponent} from "../components/VolatilityParametricComponent";
import {PriceParametricComponent} from "../components/PriceParametricComponent";
import {AdvParametricComponent} from "../components/AdvParametricComponent";
import {parametricDialogDisplayState} from "../atoms/dialog-state";

export const ParametricsApp = () =>
{
    const windowId = useMemo(() => window.command.getWindowId("Parametrics"), []);
    const [selectedTab, setSelectedTab] = useState("1");
    const setDialogState = useSetRecoilState(parametricDialogDisplayState);
    const kindByTab = { "1": "volatility", "2": "rate", "3": "price", "4": "adv" };

    return (
        <>
            <TitleBarComponent title="Parametrics" windowId={windowId} showChannel={true} showTools={false}
                addButtonProps={{ tooltipText: "Add Parametric...", handler: () => setDialogState({ open: true, mode: 'add', data: null, kind: kindByTab[selectedTab] }) }}/>
            <div style={{ width: '100%', height: 'calc(100vh - 95px)', float: 'left', padding: '0px', margin:'45px 0px 0px 0px'}}>
                <div className="parametric-app">
                    <TabContext value={selectedTab}>
                        <Box>
                            <TabList className="parametric-tab-list" onChange={(event, newValue) =>
                            {
                                setSelectedTab(newValue);
                                setDialogState({ open: false, mode: 'add', data: null, kind: null });
                            }}>
                                <Tab className="volatility-parametric-tab" label={"Volatility"} value="1"/>
                                <Tab className="interest-rate-parametric-tab" label={"Interest Rate"} value="2"/>
                                <Tab className="price-parametric-tab" label={"Prices"} value="3"/>
                                <Tab className="adv-parametric-tab" label={"ADV"} value="4"/>
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
                        <TabPanel value='4' className="adv-parametric">
                            <AdvParametricComponent/>
                        </TabPanel>
                    </TabContext>
                </div>
            </div>
        </>);
}
