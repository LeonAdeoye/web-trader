import * as React from 'react';
import {GenericGridComponent} from "./GenericGridComponent";
import {useEffect, useState, useCallback} from "react";
import {numberFormatter} from "../utilities";

export const OrdersApp = () =>
{
    const [orders, setOrders] = useState([]);
    const [worker, setWorker] = useState(null);

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
        {headerName: "Execution Algo", field: "executionAlgo", sortable: true, minWidth: 180, width: 180, filter: true},
        {headerName: "Client", field: "client", sortable: true, minWidth: 100, width: 250, filter: true},
        {headerName: "Order State", field: "orderState", sortable: true, minWidth: 100, width: 130, filter: true},
        {headerName: "RIC", field: "stockCode", sortable: true, minWidth: 100, width: 100, filter: true},
        {headerName: "Side", field: "side", sortable: true, minWidth: 90, width: 90, filter: true},
        {headerName: "Px", field: "price", sortable: false, minWidth: 100, width: 100, filter: true, headerTooltip: 'Original order price'},
        {headerName: "Avg Px", field: "averagePrice", sortable: true, minWidth: 100, width: 100, filter: false, headerTooltip: 'Average executed price', valueFormatter: numberFormatter},
        {headerName: "ADV20", field: "adv20", sortable: true, minWidth: 100, width: 100, filter: true, headerTooltip: 'Average daily volume over the last 20 days'},
        {headerName: "Qty", field: "quantity", sortable: true, minWidth: 100, width: 100, filter: true, headerTooltip: 'Original order quantity'},
        {headerName: "Pending", field: "pending", sortable: true, minWidth: 100, width: 120, filter: false, headerTooltip: 'Pending quantity', valueFormatter: numberFormatter},
        {headerName: "Executed", field: "executed", sortable: true, minWidth: 100, width: 120, filter: false, headerTooltip: 'Executed quantity', valueFormatter: numberFormatter},
        {headerName: "Notional USD", field: "notionalValue", sortable: true, minWidth: 140, width: 140, filter: false, headerTooltip: 'Notional value in USD', valueFormatter: numberFormatter}
    ];

    return (<GenericGridComponent rowHeight={25}
                                  gridTheme={"ag-theme-alpine"}
                                  rowIdArray={["orderId"]}
                                  columnDefs={columnDefs}
                                  gridData={orders}/>);
};
