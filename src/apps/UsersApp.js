import * as React from 'react';
import {GenericGridComponent} from "../components/GenericGridComponent";
import {useEffect, useState, useMemo, useRef} from "react";
import {ConfigurationService} from "../services/ConfigurationService";
import {DataService} from "../services/DataService";

export const UsersApp = () =>
{
    const configurationService = useRef(new ConfigurationService()).current;
    const dataService = useRef(new DataService()).current;
    const [gridData, setGridData] = useState([]);
    // Used for context sharing between child windows.
    const windowId = useMemo(() => window.command.getWindowId("users"), []);

    useEffect(() =>
    {
        configurationService.loadConfigurations("system").then(() =>
        {
            const url = configurationService.getConfigValue("system", "user-service-get-users-url") ?? "http://localhost:20003/users";
            dataService.get(url).then(data => setGridData(data));
        });
    }, [dataService, configurationService]);

    const columnDefs = [
        {headerName: "User Id", field: "userId", sortable: true, minWidth: 100, width: 130},
        {headerName: "Full Name", field: "fullName", sortable: true, minWidth: 250, width: 250},
        {headerName: "Region", field: "region", sortable: true, minWidth: 100, width: 100},
        {headerName: "Country", field: "countryCode", sortable: true, minWidth: 150, width: 150},
        {headerName: "Location", field: "location", sortable: true, minWidth: 150, maxWidth: 150, width: 150},
        {headerName: "Is Active", field: "active", minWidth: 120, maxWidth: 120, width: 120}];

    return (<GenericGridComponent rowHeight={22} gridTheme={"ag-theme-alpine"} rowIdArray={["userId"]} columnDefs={columnDefs} gridData={gridData}/>);
};
