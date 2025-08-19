import {useEffect, useMemo, useCallback, useState} from "react";
import {getLimitBreachTypeColour, getPercentageColour, getSideColour, numberFormatter} from "../utilities";
import {GenericGridComponent} from "./GenericGridComponent";
import * as React from "react";

const NotionalBreachesGridComponent = () =>
{
    const [breaches, setBreaches] = useState([]);
    const [inboundWorker, setInboundWorker] = useState(null);

    useEffect(() =>
    {
        const webWorker = new Worker(new URL("../workers/notional-breach-reader.js", import.meta.url));
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
        const notionalBreach = event.data.order;
        setBreaches(prevData =>
        {
            const updatedData = [...prevData];
            const existingIndex = updatedData.findIndex(item => item.orderId === notionalBreach.orderId);
            if (existingIndex >= 0)
                updatedData[existingIndex] = notionalBreach;
            else
                updatedData.push(notionalBreach);
            return updatedData;
        });
    }, []);

    const columnDefs = useMemo(() =>
    ([
        { headerName: 'Desk', field: 'deskName', filter: true, pinned: 'left'},
        { headerName: 'Trader', field: 'traderName', filter: true, pinned: 'left'},
        { headerName: 'Desk Id', field: 'deskId', hide: true},
        { headerName: 'Trader Id', field: 'traderId', hide: true},
        { headerName: 'Breach Type', field: 'breachType', filter: true , width: 180,
            valueFormatter: (params) => `${params.data.limitPercentage} % ${params.data.breachType}`, cellStyle: params => getLimitBreachTypeColour(params)},
        { headerName: 'Order Id', field: 'orderId'},
        { headerName: 'Timestamp', field: 'tradeTimestamp', filter: true, width: 150, valueFormatter: (params) => `${params.value[3]}:${params.value[4]}:${params.value[5]}`},
        { headerName: 'Instrument', field: 'symbol', filter: true, width: 150},
        { headerName: 'Side', field: 'side', filter: true, width: 100, cellStyle: (params) => getSideColour(params)},
        { headerName: 'Price', field: 'price', width: 150},
        { headerName: 'Quantity', field: 'quantity', valueFormatter: numberFormatter, width: 180},
        { headerName: 'Currency', field: 'currency', width: 120},
        { headerName: 'Notional Local', field: 'notionalLocal', valueFormatter: numberFormatter},
        { headerName: 'Order Notional $', field: 'notionalUSD', valueFormatter: numberFormatter},
        { headerName: 'Buy Notional Limit $', field: 'buyNotionalLimit' , valueFormatter: numberFormatter },
        { headerName: 'Buy Notional $', field: 'currentBuyNotional' , valueFormatter: numberFormatter, width: 160},
        { headerName: 'Buy Utilization %', field: 'buyUtilizationPercentage' , width: 170, cellStyle: (params) => getPercentageColour(params)},
        { headerName: 'Sell Notional Limit $', field: 'sellNotionalLimit' , valueFormatter: numberFormatter},
        { headerName: 'Sell Notional $', field: 'currentSellNotional' , valueFormatter: numberFormatter, width: 160},
        { headerName: 'Sell Utilization %', field: 'sellUtilizationPercentage' , width: 170, cellStyle: (params) => getPercentageColour(params)},
        { headerName: 'Gross Notional Limit $', field: 'grossNotionalLimit' , valueFormatter: numberFormatter},
        { headerName: 'Gross Notional $', field: 'currentGrossNotional' , valueFormatter: numberFormatter, width: 170},
        { headerName: 'Gross Utilization %', field: 'grossUtilizationPercentage', width: 180, cellStyle: (params) => getPercentageColour(params) },
    ]), []);

    return (<GenericGridComponent rowHeight={22} gridTheme={"ag-theme-alpine"} rowIdArray={["orderId"]} columnDefs={columnDefs} gridData={breaches} handleAction={null}/>);
}

export default NotionalBreachesGridComponent;
