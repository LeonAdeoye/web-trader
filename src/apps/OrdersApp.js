import * as React from 'react';
import {GenericGridComponent} from "../components/GenericGridComponent";
import {useEffect, useState, useCallback, useMemo} from "react";
import {numberFormatter, orderSideStyling, orderStateStyling} from "../utilities";
import {useRecoilState} from "recoil";
import {selectedContextShareState, titleBarContextShareColourState} from "../atoms/component-state";
import {FDC3Service} from "../services/FDC3Service";
import TitleBarComponent from "../components/TitleBarComponent";

export const OrdersApp = () =>
{
    const [orders, setOrders] = useState([]);
    const [worker, setWorker] = useState(null);
    const [instrumentCode, setInstrumentCode] = useState(null);
    const [clientCode, setClientCode] = useState(null);
    const [selectedContextShare] = useRecoilState(selectedContextShareState);
    const [, setTitleBarContextShareColour] = useRecoilState(titleBarContextShareColourState);
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
                if(fdc3Message.contextShareColour)
                    setTitleBarContextShareColour(fdc3Message.contextShareColour);

                if(fdc3Message.instruments?.[0]?.id.ticker)
                    setInstrumentCode(fdc3Message.instruments[0].id.ticker);
                else
                    setInstrumentCode(null);

                if(fdc3Message.clients?.[0]?.id.name)
                    setClientCode(fdc3Message.clients[0].id.name);
                else
                    setClientCode(null);
            }
        });
    }, []);

    const filterOrdersUsingContext = useMemo(() =>
    {
        if(instrumentCode && clientCode)
            return orders.filter((order) => order.instrumentCode === instrumentCode && order.clientCode === clientCode);
        else if(instrumentCode)
            return orders.filter((order) => order.instrumentCode === instrumentCode);
        else if(clientCode)
            return orders.filter((order) => order.clientCode === clientCode);
        else
            return orders;
    }, [orders, instrumentCode, clientCode]);

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
            if(selectedContextShare[0].contextShareKey === 'instrumentCode')
                window.messenger.sendMessageToMain(FDC3Service.createContextShare(selectedContextShare[0].contextShareValue, null), null, windowId);
            else
                window.messenger.sendMessageToMain(FDC3Service.createContextShare(null, selectedContextShare[0].contextShareValue), null, windowId);
        }
        else if(selectedContextShare.length === 2)
        {
            const instrumentCode = selectedContextShare.find((contextShare) => contextShare.contextShareKey === 'instrumentCode').contextShareValue;
            const clientCode = selectedContextShare.find((contextShare) => contextShare.contextShareKey === 'clientCode').contextShareValue;
            window.messenger.sendMessageToMain(FDC3Service.createContextShare(instrumentCode, clientCode), null, windowId);
        }
    }, [selectedContextShare]);

    const columnDefs = useMemo(() => ([
        {headerName: "Parent Order Id", field: "orderId", sortable: true, minWidth: 225, width: 225, filter: true},
        {headerName: "Qty", field: "quantity", sortable: true, minWidth: 90, width: 90, filter: true, headerTooltip: 'Original order quantity', valueFormatter: numberFormatter},
        {headerName: "Instrument", field: "instrumentCode", sortable: true, minWidth: 105, width: 105, filter: true},
        {headerName: "Side", field: "side", sortable: true, minWidth: 75, width: 75, filter: true, cellStyle: params => orderSideStyling(params.value)},
        {headerName: "Stock Desc.", field: "instrumentDescription", hide: true, sortable: true, minWidth: 150, width: 150, filter: true},
        {headerName: "Px", field: "price", sortable: false, minWidth: 75, width: 75, filter: true, headerTooltip: 'Original order price', valueFormatter: numberFormatter},
        {headerName: "Client Code", field: "clientCode", sortable: true, minWidth: 105, width: 105, filter: true},
        {headerName: "Client Desc", field: "clientDescription", sortable: true, minWidth: 160, width: 160, filter: true},
        {headerName: "State", field: "state", sortable: true, minWidth: 100, width: 100, filter: true, cellStyle: params => orderStateStyling(params.value)},
        {headerName: "BLG", field: "blgCode", hide: true, sortable: true, minWidth: 85, width: 85, filter: true},
        {headerName: "Owner", field: "ownerId", sortable: true, minWidth: 80, width: 80},
        {headerName: "Instruction", field: "traderInstruction", sortable: true, minWidth: 110, width: 110, filter: true},
        {headerName: "CCY", field: "settlementCurrency", sortable: true, minWidth: 90, width: 90, filter: true},
        {headerName: "Exec Algo", field: "algoType", sortable: true, minWidth: 100, width: 100, filter: true},
        {headerName: "Arrived", field: "arrivalTime", sortable: true, minWidth: 90, width: 90},
        {headerName: "Arr Px", field: "arrivalPrice", sortable: true, minWidth: 80, width: 80},
        {headerName: "Avg Px", field: "averagePrice", sortable: true, minWidth: 80, width: 80, filter: false, headerTooltip: 'Average executed price', valueFormatter: numberFormatter},
        {headerName: "ADV20", field: "adv20", hide: false, sortable: true, minWidth: 85, width: 85, filter: true, headerTooltip: 'Average daily volume over the last 20 days'},
        {headerName: "Exec Trg", field: "executionTrigger", hide: true, sortable: true, minWidth: 130, width: 130, filter: true},
        {headerName: "Pending", field: "pending", sortable: true, minWidth: 90, width: 90, filter: false, headerTooltip: 'Pending quantity', valueFormatter: numberFormatter},
        {headerName: "Executed", field: "executed", sortable: true, minWidth: 90, width: 90, filter: false, headerTooltip: 'Executed quantity', valueFormatter: numberFormatter},
        {headerName: "$Exec Notional", field: "executedNotionalValue", sortable: true, minWidth: 110, width: 110, filter: false, headerTooltip: 'Executed notional value in USD', valueFormatter: numberFormatter},
        {headerName: "$Order Notional", field: "orderNotionalValue", sortable: true, minWidth: 110, width: 110, filter: false, headerTooltip: 'Original order notional value in USD', valueFormatter: numberFormatter},
        {headerName: "Order Notional", field: "orderNotionalValueInLocal", sortable: true, minWidth: 110, width: 110, filter: false, headerTooltip: 'Original order notional value in local currency', valueFormatter: numberFormatter},
        {headerName: "$Resid. Notional", field: "residualNotionalValue", sortable: true, minWidth: 110, width: 110, filter: false, headerTooltip: 'Residual notional value in USD', valueFormatter: numberFormatter},
        {headerName: "IVWAP", field: "ivwap", headerTooltip: 'Interval VWAP', hide: true, sortable: false, minWidth: 100, width: 100, filter: false, valueFormatter: numberFormatter},
        {headerName: "Perf Arrival", field: "performanceVsArrival", headerTooltip: 'Performance versus arrival in USD', hide: false, sortable: false, minWidth: 100, width: 110, filter: false, valueFormatter: numberFormatter},
        {headerName: "Perf Arrival (bps)", field: "performanceVsArrivalBPS", headerTooltip: 'Performance versus arrival in bps', hide: false, sortable: false, minWidth: 100, width: 130, filter: false},
        {headerName: "Perf IVWAP", field: "performanceVsIVWAP", headerTooltip: 'Performance versus interval VWAP in USD', hide: true, sortable: false, minWidth: 100, width: 110, filter: false, valueFormatter: numberFormatter},
        {headerName: "Perf IVWAP (bps)", field: "performanceVsIVWAPBPS", headerTooltip: 'Performance versus interval VWAP in bps', hide: true, sortable: false, minWidth: 100, width: 120, filter: false},
    ]), []);

    return (<>
        <TitleBarComponent title="Orders" windowId={windowId} addButtonProps={undefined} showChannel={true} showTools={false}/>
        <div style={{ width: '100%', height: 'calc(100vh - 75px)', float: 'left', padding: '0px', margin:'45px 0px 0px 0px'}}>
            <div className="ag-theme-alpine" style={{ height: '100%', width: '100%' , padding: '0px', margin:'0px'}}>
                <GenericGridComponent rowHeight={22} gridTheme={"ag-theme-alpine"} rowIdArray={["orderId"]} columnDefs={columnDefs} gridData={filterOrdersUsingContext}/>);
            </div>
        </div>
    </>)

}
