import * as React from 'react';
import {GenericGridComponent} from "./GenericGridComponent";
import {useEffect, useState, useCallback} from "react";
import {numberFormatter} from "../utilities";

export const AlertsApp = () =>
{
    const [alerts, setAlerts] = useState([]);
    const [worker, setWorker] = useState(null);

    useEffect(() =>
    {
        const webWorker = new Worker(new URL("../workers/alert-reader.js", import.meta.url));
        setWorker(webWorker);
        return () => webWorker.terminate();
    }, []);

    const handleWorkerMessage = useCallback((event) =>
    {
        const newAlert = event.data.alert;

        setAlerts((prevData) =>
        {
            const index = prevData.findIndex((element) => element.id === newAlert.id);
            if (index !== -1)
            {
                const updatedData = [...prevData];
                updatedData[index] = newAlert;
                return updatedData;
            }
            else
                return [...prevData, newAlert];
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
        {headerName: "Id", field: "id", hide: true, sortable: false, minWidth: 130, width: 130},
        {headerName: "Type", field: "type", sortable: true, minWidth: 170, width: 170, filter: true},
        {headerName: "Alert Details", field: "alertDetails", sortable: true, minWidth: 400, width: 400, filter: true},
        {headerName: "Time", field: "time", sortable: true, minWidth: 90, width: 90},
        {headerName: "Priority", field: "priority", sortable: true, minWidth: 100, width: 100, filter: true},
        {headerName: "Client", field: "client", sortable: true, minWidth: 100, width: 250, filter: true},
        {headerName: "Order Id", field: "orderId", sortable: true, minWidth: 100, width: 150, filter: true},
        {headerName: "Order State", field: "orderState", sortable: true, minWidth: 130, width: 130, filter: true},
        {headerName: "RIC", field: "stockCode", sortable: true, minWidth: 100, width: 100, filter: true},
        {headerName: "Side", field: "side", sortable: true, minWidth: 90, width: 90, filter: true},
        {headerName: "Px", field: "price", sortable: false, minWidth: 100, width: 100, filter: true, headerTooltip: 'Original order price'},
        {headerName: "Pending", field: "pending", sortable: true, minWidth: 100, width: 120, filter: false, headerTooltip: 'Pending quantity', valueFormatter: numberFormatter},
        {headerName: "Executed", field: "executed", sortable: true, minWidth: 100, width: 120, filter: false, headerTooltip: 'Executed quantity', valueFormatter: numberFormatter},
        {headerName: "Avg Px", field: "averagePrice", sortable: true, minWidth: 100, width: 100, filter: false, headerTooltip: 'Average executed price', valueFormatter: numberFormatter},
        {headerName: "Notional USD", field: "notionalValue", sortable: true, minWidth: 140, width: 140, filter: false, headerTooltip: 'Notional value in USD', valueFormatter: numberFormatter}
    ];

    return (<GenericGridComponent rowHeight={25}
                                  gridTheme={"ag-theme-alpine"}
                                  rowIdArray={["id"]}
                                  columnDefs={columnDefs}
                                  gridData={alerts}/>);
};
