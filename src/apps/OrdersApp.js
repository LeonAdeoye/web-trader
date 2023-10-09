import * as React from 'react';
import {GenericGridComponent} from "../components/GenericGridComponent";
import {useEffect, useState, useCallback, useMemo} from "react";
import {numberFormatter, orderSideStyling, orderStateStyling} from "../utilities";
import {useRecoilState} from "recoil";
import {selectedContextShareState} from "../atoms/component-state";
import {FDC3Service} from "../services/FDC3Service";

export const OrdersApp = () =>
{
    const [orders, setOrders] = useState([]);
    const [worker, setWorker] = useState(null);
    const [stockCode, setStockCode] = useState(null);
    const [client, setClient] = useState(null);
    const [selectedContextShare] = useRecoilState(selectedContextShareState);

    // Used for context sharing between child windows.
    const windowId = useMemo(() => window.command.getWindowId("orders"), []);

    useEffect(() =>
    {
        const webWorker = new Worker(new URL("../workers/order-reader.js", import.meta.url));
        setWorker(webWorker);
        return () => webWorker.terminate();
    }, []);

    useEffect(() =>
    {
        window.messenger.handleMessageFromMain((fdc3Message, _, __) =>
        {
            if(fdc3Message.type === "fdc3.context")
            {
                if(fdc3Message.instruments?.[0]?.id.ticker)
                    setStockCode(fdc3Message.instruments[0].id.ticker);
                else
                    setStockCode(null);

                if(fdc3Message.clients?.[0]?.id.name)
                    setClient(fdc3Message.clients[0].id.name);
                else
                    setClient(null);
            }
        });
    }, []);

    const filterOrdersUsingContext = useMemo(() =>
    {
        if(stockCode && client)
            return orders.filter((order) => order.stockCode === stockCode && order.client === client);
        else if(stockCode)
            return orders.filter((order) => order.stockCode === stockCode);
        else if(client)
            return orders.filter((order) => order.client === client);
        else
            return orders;
    }, [orders, stockCode, client]);

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

    useEffect(() =>
    {
        if(selectedContextShare.length === 1)
        {
            if(selectedContextShare[0].contextShareKey === 'stockCode')
                window.messenger.sendMessageToMain(FDC3Service.createContextShare(selectedContextShare[0].contextShareValue, null), null, windowId);
            else
                window.messenger.sendMessageToMain(FDC3Service.createContextShare(null, selectedContextShare[0].contextShareValue), null, windowId);
        }
        else if(selectedContextShare.length === 2)
        {
            const stockCode = selectedContextShare.find((contextShare) => contextShare.contextShareKey === 'stockCode').contextShareValue;
            const client = selectedContextShare.find((contextShare) => contextShare.contextShareKey === 'client').contextShareValue;
            window.messenger.sendMessageToMain(FDC3Service.createContextShare(stockCode, client), null, windowId);
        }
    }, [selectedContextShare]);

    const columnDefs = useMemo(() => ([
        {headerName: "Order Id", field: "orderId", sortable: true, minWidth: 120, width: 120, filter: true},
        {headerName: "Client Order Id", field: "clientOrderId", sortable: true, minWidth: 120, width: 120, filter: true},
        {headerName: "Instruction", field: "instruction", sortable: true, minWidth: 110, width: 110, filter: true},
        {headerName: "Arrived", field: "arrivalTime", sortable: true, minWidth: 90, width: 90},
        {headerName: "Arr Px", field: "arrivalPrice", sortable: true, minWidth: 80, width: 80},
        {headerName: "Exec Algo", field: "executionAlgo", sortable: true, minWidth: 130, width: 130, filter: true},
        {headerName: "Exec Trg", field: "executionTrigger", hide: true, sortable: true, minWidth: 130, width: 130, filter: true},
        {headerName: "Client", field: "client", sortable: true, minWidth: 160, width: 160, filter: true},
        {headerName: "State", field: "orderState", sortable: true, minWidth: 100, width: 100, filter: true, cellStyle: params => orderStateStyling(params.value)},
        {headerName: "Stock Code", field: "stockCode", sortable: true, minWidth: 85, width: 85, filter: true},
        {headerName: "BLG", field: "blg", hide: true, sortable: true, minWidth: 85, width: 85, filter: true},
        {headerName: "Stock Desc.", field: "stockDescription", hide: true, sortable: true, minWidth: 150, width: 150, filter: true},
        {headerName: "Side", field: "side", sortable: true, minWidth: 80, width: 80, filter: true, cellStyle: params => orderSideStyling(params.value)},
        {headerName: "Px", field: "price", sortable: false, minWidth: 75, width: 75, filter: true, headerTooltip: 'Original order price', valueFormatter: numberFormatter},
        {headerName: "Avg Px", field: "averagePrice", sortable: true, minWidth: 80, width: 80, filter: false, headerTooltip: 'Average executed price', valueFormatter: numberFormatter},
        {headerName: "ADV20", field: "adv20", sortable: true, minWidth: 85, width: 85, filter: true, headerTooltip: 'Average daily volume over the last 20 days'},
        {headerName: "Qty", field: "quantity", sortable: true, minWidth: 90, width: 90, filter: true, headerTooltip: 'Original order quantity', valueFormatter: numberFormatter},
        {headerName: "Pending", field: "pending", sortable: true, minWidth: 90, width: 90, filter: false, headerTooltip: 'Pending quantity', valueFormatter: numberFormatter},
        {headerName: "Executed", field: "executed", sortable: true, minWidth: 90, width: 90, filter: false, headerTooltip: 'Executed quantity', valueFormatter: numberFormatter},
        {headerName: "Exec Notional", field: "executedNotionalValue", sortable: true, minWidth: 110, width: 110, filter: false, headerTooltip: 'Executed notional value in USD', valueFormatter: numberFormatter},
        {headerName: "Order Notional", field: "orderNotionalValue", sortable: true, minWidth: 110, width: 110, filter: false, headerTooltip: 'Original order notional value in USD', valueFormatter: numberFormatter},
        {headerName: "Residual Notional", field: "residualNotionalValue", sortable: true, minWidth: 110, width: 110, filter: false, headerTooltip: 'Residual notional value in USD', valueFormatter: numberFormatter},
        {headerName: "IVWAP", field: "ivwap", headerTooltip: 'Interval VWAP', hide: false, sortable: false, minWidth: 100, width: 100, filter: false, valueFormatter: numberFormatter},
        {headerName: "Perf Arrival", field: "performanceVsArrival", headerTooltip: 'Performance versus arrival in USD', hide: false, sortable: false, minWidth: 100, width: 110, filter: false, valueFormatter: numberFormatter},
        {headerName: "Perf Arrival (bps)", field: "performanceVsArrivalBPS", headerTooltip: 'Performance versus arrival in bps', hide: false, sortable: false, minWidth: 100, width: 130, filter: false},
        {headerName: "Perf IVWAP", field: "performanceVsIVWAP", headerTooltip: 'Performance versus interval VWAP in USD', hide: false, sortable: false, minWidth: 100, width: 110, filter: false, valueFormatter: numberFormatter},
        {headerName: "Perf IVWAP (bps)", field: "performanceVsIVWAPBPS", headerTooltip: 'Performance versus interval VWAP in bps', hide: false, sortable: false, minWidth: 100, width: 120, filter: false},
    ]), []);

    return (<GenericGridComponent rowHeight={22} gridTheme={"ag-theme-alpine"} rowIdArray={["orderId"]}
                                  columnDefs={columnDefs} gridData={filterOrdersUsingContext}/>);

}
