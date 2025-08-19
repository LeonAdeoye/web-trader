import {useEffect, useMemo, useState, useCallback} from "react";
import {getPercentageColour, numberFormatter} from "../utilities";
import {GenericGridComponent} from "./GenericGridComponent";
import * as React from "react";

const TraderNotionalGridComponent = () =>
{
    const [traderData, setTraderData] = useState([]);
    const [inboundWorker, setInboundWorker] = useState(null);

    useEffect(() =>
    {
        const webWorker = new Worker(new URL("../workers/trader-notional-reader.js", import.meta.url));
        setInboundWorker(webWorker);
        return () => webWorker.terminate();
    }, []);

    useEffect(() =>
    {
        if (inboundWorker)
            inboundWorker.onmessage = handleWorkerMessage;

        return () =>
        {
            if (inboundWorker)
                inboundWorker.onmessage = null;
        };
    }, [inboundWorker]);

    const handleWorkerMessage = useCallback((event) =>
    {
        const traderNotional = event.data.order;
        setTraderData(prevData =>
        {
            const updatedData = [...prevData];
            const existingIndex = updatedData.findIndex(item => item.traderId === traderNotional.traderId);
            if (existingIndex >= 0)
                updatedData[existingIndex] = traderNotional;
            else
                updatedData.push(traderNotional);
            return updatedData;
        });
    }, []);

    const columnDefs = useMemo(() =>
    ([
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

    return (<GenericGridComponent rowHeight={22} gridTheme={"ag-theme-alpine"} rowIdArray={["traderId"]} columnDefs={columnDefs} gridData={traderData} handleAction={null}/>);
}

export default TraderNotionalGridComponent;
