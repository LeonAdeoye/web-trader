import {useEffect, useMemo} from "react";
import {getPercentageColour, numberFormatter} from "../utilities";
import {GenericGridComponent} from "./GenericGridComponent";
import * as React from "react";

const TraderNotionalGridComponent = () =>
{
    const traderData = [];

    useEffect(() =>
    {

    }, []);

    const columnDefs = useMemo(() => ([
        { headerName: 'Trader', field: 'traderName', width: 150, filter: true},
        { headerName: 'Trader Id', field: 'traderId', width: 150, hide: true},
        { headerName: 'Desk', field: 'deskName', width: 200, filter: true},
        { headerName: 'Buy Notional Limit', field: 'buyNotionalLimit', valueFormatter: numberFormatter},
        { headerName: 'Current Buy Notional', field: 'currentBuyNotional' , valueFormatter: numberFormatter},
        { headerName: 'Current Buy Utilization %', field: 'buyUtilizationPercentage', cellStyle: (params) => getPercentageColour(params)},
        { headerName: 'Sell Notional Limit', field: 'sellNotionalLimit' , valueFormatter: numberFormatter},
        { headerName: 'Current Sell Notional', field: 'currentSellNotional' , valueFormatter: numberFormatter},
        { headerName: 'Current Sell Utilization %', field: 'sellUtilizationPercentage', cellStyle: (params) => getPercentageColour(params)},
        { headerName: 'Gross Notional Limit', field: 'grossNotionalLimit' , valueFormatter: numberFormatter},
        { headerName: 'Current Gross Notional', field: 'currentGrossNotional' , valueFormatter: numberFormatter},
        { headerName: 'Current Gross Utilization %', field: 'grossUtilizationPercentage', width: 220, cellStyle: (params) => getPercentageColour(params)}
    ]), []);

    return (
        <div style={{ marginTop: 10, marginLeft: 10, height: 500, width: '99%'}}>
            <GenericGridComponent
                rowHeight={22}
                gridTheme={"ag-theme-alpine"}
                rowIdArray={["orderId"]}
                columnDefs={columnDefs}
                gridData={traderData}
                handleAction={null}
            />
        </div>
    );
}

export default TraderNotionalGridComponent;
