import {useEffect, useMemo} from "react";
import {getPercentageColour, numberFormatter} from "../utilities";
import {GenericGridComponent} from "./GenericGridComponent";
import * as React from "react";


const DeskNotionalGridComponent = () =>
{
    const deskData = [];

    useEffect(() =>
    {

    }, []);

    const columnDefs = useMemo(() => ([
        { headerName: 'DeskName', field: 'deskName', filter: true},
        { headerName: 'Desk Id', field: 'deskId', hide: true},
        { headerName: 'Buy Notional Limit', field: 'buyNotionalLimit' , valueFormatter: numberFormatter},
        { headerName: 'Current Buy Notional', field: 'currentBuyNotional' , valueFormatter: numberFormatter},
        { headerName: 'Current Buy Utilization %', field: 'buyUtilizationPercentage', cellStyle: (params) => getPercentageColour(params)},
        { headerName: 'Sell Notional Limit', field: 'sellNotionalLimit' , valueFormatter: numberFormatter},
        { headerName: 'Current Sell Notional', field: 'currentSellNotional' , valueFormatter: numberFormatter},
        { headerName: 'Current Sell Utilization %', field: 'sellUtilizationPercentage', cellStyle: (params) => getPercentageColour(params)},
        { headerName: 'Gross Notional Limit', field: 'grossNotionalLimit' , valueFormatter: numberFormatter},
        { headerName: 'Current Gross Notional', field: 'currentGrossNotional' , valueFormatter: numberFormatter},
        { headerName: 'Current Gross Utilization %', field: 'grossUtilizationPercentage' , width: 220, cellStyle: (params) => getPercentageColour(params)},
    ]), []);

    return (<GenericGridComponent rowHeight={22} gridTheme={"ag-theme-alpine"} rowIdArray={["orderId"]} columnDefs={columnDefs} gridData={deskData} handleAction={null}/>);
}

export default DeskNotionalGridComponent;
