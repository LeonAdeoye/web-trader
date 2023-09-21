import * as React from 'react';
import {GenericGridComponent} from "./GenericGridComponent";
import {useEffect, useState, useCallback, useMemo} from "react";
import {numberFormatter} from "../utilities";

export const OrdersApp = () =>
{
    const [orders, setOrders] = useState([]);
    const [worker, setWorker] = useState(null);
    // Used for context sharing between child windows.
    const windowId = useMemo(() => window.command.getWindowId("orders"), []);


    useEffect(() =>
    {
        const webWorker = new Worker(new URL("../workers/order-reader.js", import.meta.url));
        setWorker(webWorker);
        return () => webWorker.terminate();
    }, []);

    const handleWorkerMessage = useCallback((event) =>
    {
        const newOrder = event.data.order;

        setOrders((prevData) =>
        {
            const index = prevData.findIndex((element) => element.orderId === newOrder.orderId);
            if (index !== -1)
            {
                const updatedData = [...prevData];
                updatedData[index] = newOrder;
                return updatedData;
            }
            else
                return [...prevData, newOrder];
        });

    }, []);

    useEffect(() =>
    {
        if (worker)
            worker.onmessage = handleWorkerMessage;

        return () =>
        {
            if (worker)
                worker.onmessage = null;
        };
    }, [worker]);

    const columnDefs = [
        {headerName: "Order Id", field: "orderId", sortable: true, minWidth: 170, width: 170, filter: true},
        {headerName: "Client Order Id", field: "clientOrderId", sortable: true, minWidth: 170, width: 170, filter: true},
        {headerName: "Instruction", field: "instruction", sortable: true, minWidth: 160, width: 160, filter: true},
        {headerName: "Arrived", field: "ArrivalTime", sortable: true, minWidth: 100, width: 100},
        {headerName: "Exec Algo", field: "executionAlgo", sortable: true, minWidth: 180, width: 180, filter: true},
        {headerName: "Exec Trg", field: "executionTrigger", hide: true, sortable: true, minWidth: 180, width: 180, filter: true},
        {headerName: "Client", field: "client", sortable: true, minWidth: 100, width: 250, filter: true},
        {headerName: "Order State", field: "orderState", sortable: true, minWidth: 100, width: 130, filter: true},
        {headerName: "RIC", field: "ric", sortable: true, minWidth: 100, width: 100, filter: true},
        {headerName: "BLG", field: "blg", hide: true, sortable: true, minWidth: 100, width: 100, filter: true},
        {headerName: "Stock Desc.", field: "stockDescription", hide: true, sortable: true, minWidth: 200, width: 200, filter: true},
        {headerName: "Side", field: "side", sortable: true, minWidth: 90, width: 90, filter: true},
        {headerName: "Px", field: "price", sortable: false, minWidth: 100, width: 100, filter: true, headerTooltip: 'Original order price'},
        {headerName: "Avg Px", field: "averagePrice", sortable: true, minWidth: 100, width: 100, filter: false, headerTooltip: 'Average executed price', valueFormatter: numberFormatter},
        {headerName: "ADV20", field: "adv20", sortable: true, minWidth: 100, width: 100, filter: true, headerTooltip: 'Average daily volume over the last 20 days'},
        {headerName: "Qty", field: "quantity", sortable: true, minWidth: 100, width: 100, filter: true, headerTooltip: 'Original order quantity'},
        {headerName: "Pending", field: "pending", sortable: true, minWidth: 100, width: 120, filter: false, headerTooltip: 'Pending quantity', valueFormatter: numberFormatter},
        {headerName: "Executed", field: "executed", sortable: true, minWidth: 100, width: 120, filter: false, headerTooltip: 'Executed quantity', valueFormatter: numberFormatter},
        {headerName: "Exec Notional", field: "executedNotionalValue", sortable: true, minWidth: 150, width: 150, filter: false, headerTooltip: 'Executed notional value in USD', valueFormatter: numberFormatter},
        {headerName: "Order Notional", field: "orderNotionalValue", sortable: true, minWidth: 140, width: 140, filter: false, headerTooltip: 'Original order notional value in USD', valueFormatter: numberFormatter},
        {headerName: "Residual Notional", field: "residualNotionalValue", sortable: true, minWidth: 150, width: 150, filter: false, headerTooltip: 'Residual notional value in USD', valueFormatter: numberFormatter},
        {headerName: "Perf Arrival", field: "performanceVsArrival", headerTooltip: 'Performance versus arrival in USD', hide: false, sortable: false, minWidth: 100, width: 150, filter: false, valueFormatter: numberFormatter},
        {headerName: "Perf Arrival (bps)", field: "performanceVsArrivalBPS", headerTooltip: 'Performance versus arrival in bps', hide: false, sortable: false, minWidth: 100, width: 150, filter: false},
        {headerName: "Perf IVWAP", field: "performanceVsIVWAP", headerTooltip: 'Performance versus interval VWAP in USD', hide: false, sortable: false, minWidth: 100, width: 150, filter: false, valueFormatter: numberFormatter},
        {headerName: "Perf IVWAP (bps)", field: "performanceVsIVWAPlBPS", headerTooltip: 'Performance versus interval VWAP in bps', hide: false, sortable: false, minWidth: 100, width: 150, filter: false},
    ];

    return (<GenericGridComponent rowHeight={25} gridTheme={"ag-theme-alpine"} rowIdArray={["orderId"]} columnDefs={columnDefs} gridData={orders}/>);

}
