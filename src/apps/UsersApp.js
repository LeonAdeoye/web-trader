import * as React from 'react';
import {GenericGridComponent} from "../components/GenericGridComponent";
import {useEffect, useState, useMemo, useRef} from "react";
import {ConfigurationService} from "../services/ConfigurationService";
import {TradeDataService} from "../services/TradeDataService";
import TitleBarComponent from "../components/TitleBarComponent";

export const UsersApp = () =>
{
    const configurationService = useRef(new ConfigurationService()).current;
    const tradeDataService = useRef(new TradeDataService()).current;
    const [gridData, setGridData] = useState([]);
    // Used for context sharing between child windows.
    const windowId = useMemo(() => window.command.getWindowId("Users"), []);

    useEffect(() =>
    {
        configurationService.loadConfigurations("system").then(() =>
        {
            const url = configurationService.getConfigValue("system", "user-service-get-users-url") ?? "http://localhost:20003/users";
            tradeDataService.get(url).then(data => setGridData(data));
        });
    }, [tradeDataService, configurationService]);

    const columnDefs = useMemo(() => ([
        {headerName: "User Id", field: "userId", sortable: true, minWidth: 100, width: 130},
        {headerName: "Full Name", field: "fullName", sortable: true, minWidth: 250, width: 250},
        {headerName: "Region", field: "region", sortable: true, minWidth: 100, width: 100},
        {headerName: "Country", field: "countryCode", sortable: true, minWidth: 150, width: 150},
        {headerName: "Location", field: "location", sortable: true, minWidth: 150, maxWidth: 150, width: 150},
        {headerName: "Is Active", field: "active", minWidth: 120, maxWidth: 120, width: 120}]), []);

    return (<>
                <TitleBarComponent title="Users" windowId={windowId} addButtonProps={undefined} showChannel={false} showTools={false}/>
                <div className="users-app" style={{width: '100%', height: 'calc(100vh - 65px)', float: 'left', padding: '0px', margin:'45px 0px 0px 0px'}}>
                    <GenericGridComponent rowHeight={22} gridTheme={"ag-theme-alpine"} rowIdArray={["userId"]} columnDefs={columnDefs} gridData={gridData}/>
                </div>
            </>);
};
