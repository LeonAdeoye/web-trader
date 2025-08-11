import TitleBarComponent from "../components/TitleBarComponent";
import {GenericGridComponent} from "../components/GenericGridComponent";
import {useMemo, useRef, useState} from "react";
import * as React from 'react';
import {TabContext, TabList, TabPanel} from "@mui/lab";
import {Tab} from "@mui/material";
import {LoggerService} from "../services/LoggerService";
import {useRecoilState} from "recoil";
import {referenceDataDialogDisplayState} from "../atoms/dialog-state";
import ReferenceDataDialog from "../dialogs/ReferenceDataDialog";

export const ReferenceDataApp = () =>
{
    const windowId = useMemo(() => window.command.getWindowId("Reference Data"), []);
    const loggerService = useRef(new LoggerService(ReferenceDataApp.name)).current;
    const [selectedTab, setSelectedTab] = useState("1");
    const [clients, setClients] = useState([]);
    const [exchanges, setExchanges] = useState([]);
    const [, setReferenceDataDialogOpenFlag] = useRecoilState(referenceDataDialogDisplayState);

    const clientColumnDefs = useMemo(() => ( [
        {
            headerName: 'Client Id',
            field: 'clientId',
            width: 230,
            headerTooltip: 'Client Id',
            sortable: true,
            filter: true,
        },
    ]), []);

    const exchangeColumnDefs = useMemo(() => ( [
        {
            headerName: 'Exchange Id',
            field: 'exchangeId',
            width: 230,
            headerTooltip: 'Exchange Id',
            sortable: true,
            filter: true,
        },
    ]), []);

    return (<>
        <TitleBarComponent title="Reference Data" windowId={windowId} addButtonProps={{ handler: () => setReferenceDataDialogOpenFlag(true), tooltipText: "Add Reference Data..." }} showChannel={true} showTools={false}/>
        <div className="reference-app" style={{width: '100%', height: 'calc(100vh - 131px)', float: 'left', padding: '0px', margin:'45px 0px 0px 0px'}}>
            <TabContext value={selectedTab}>
                <TabList className="reference-tab-list" onChange={(event, newValue) => setSelectedTab(newValue)}>
                    <Tab className="clients-tab" label={"Clients"} value="1" sx={{ marginRight: "5px",  minHeight: "25px", height: "25px", backgroundColor: "#bdbaba", color: "white", '&.Mui-selected': {backgroundColor: '#656161',  color: "white"}}}/>
                    <Tab className="exchanges-tab" label={"Exchanges"} value="2"  sx={{ minHeight: "25px", height: "25px", backgroundColor: "#bdbaba", color: "white", '&.Mui-selected': {backgroundColor: '#656161', color: "white"}}}/>
                    <Tab className="brokers-tab" label={"Brokers"} value="3"  sx={{ minHeight: "25px", height: "25px", backgroundColor: "#bdbaba", color: "white", '&.Mui-selected': {backgroundColor: '#656161', color: "white"}}}/>
                    <Tab className="currencies-tab" label={"Currencies"} value="4"  sx={{ minHeight: "25px", height: "25px", backgroundColor: "#bdbaba", color: "white", '&.Mui-selected': {backgroundColor: '#656161', color: "white"}}}/>
                    <Tab className="accounts-tab" label={"Accounts"} value="5"  sx={{ minHeight: "25px", height: "25px", backgroundColor: "#bdbaba", color: "white", '&.Mui-selected': {backgroundColor: '#656161', color: "white"}}}/>
                    <Tab className="desks-tab" label={"Desks"} value="6"  sx={{ minHeight: "25px", height: "25px", backgroundColor: "#bdbaba", color: "white", '&.Mui-selected': {backgroundColor: '#656161', color: "white"}}}/>
                    <Tab className="instruments-tab" label={"Instruments"} value="7"  sx={{ minHeight: "25px", height: "25px", backgroundColor: "#bdbaba", color: "white", '&.Mui-selected': {backgroundColor: '#656161', color: "white"}}}/>
                    <Tab className="traders-tab" label={"Traders"} value="8"  sx={{ minHeight: "25px", height: "25px", backgroundColor: "#bdbaba", color: "white", '&.Mui-selected': {backgroundColor: '#656161', color: "white"}}}/>
                </TabList>
                {selectedTab === "1" && (
                    <TabPanel value="1" className="client-ref-data" sx={{ padding: 0, margin: 0 }}>
                        <GenericGridComponent rowHeight={22} gridTheme={"ag-theme-alpine"} rowIdArray={["clientId"]} columnDefs={clientColumnDefs} gridData={clients} windowId={windowId}/>
                    </TabPanel>
                )}
                {selectedTab === "2" && (
                    <TabPanel value="2" className="exchange-ref-data" sx={{ padding: 0, margin: 0 }}>
                        <GenericGridComponent rowHeight={22} gridTheme={"ag-theme-alpine"} rowIdArray={["exchangeId"]} columnDefs={exchangeColumnDefs} gridData={exchanges} windowId={windowId}/>
                    </TabPanel>
                )}
            </TabContext>
        </div>
        <ReferenceDataDialog dataName={'Clients'}/>
    </>)
}
