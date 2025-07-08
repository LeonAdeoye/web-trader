import * as React from 'react';
import {GenericGridComponent} from "../components/GenericGridComponent";
import {useEffect, useState, useCallback, useMemo, useRef} from "react";
import {numberFormatter, orderSideStyling, orderStateStyling, replaceUnderscoresWithSpace} from "../utilities";
import {useRecoilState} from "recoil";
import {selectedContextShareState, selectedGenericGridRowState, titleBarContextShareColourState} from "../atoms/component-state";
import {sliceDialogDisplayState} from "../atoms/dialog-state";
import {FDC3Service} from "../services/FDC3Service";
import TitleBarComponent from "../components/TitleBarComponent";
import {LoggerService} from "../services/LoggerService";
import SliceDialog from "../dialogs/SliceDialog";

export const OrdersApp = () =>
{
    const [orders, setOrders] = useState([]);
    const [inboundWorker, setInboundWorker] = useState(null);
    const [outboundWorker, setOutboundWorker] = useState(null);
    const [instrumentCode, setInstrumentCode] = useState(null);
    const [clientCode, setClientCode] = useState(null);
    const [selectedContextShare] = useRecoilState(selectedContextShareState);
    const [, setTitleBarContextShareColour] = useRecoilState(titleBarContextShareColourState);
    const [, setSliceDialogOpenFlag ] = useRecoilState(sliceDialogDisplayState);
    const [selectedGenericGridRow] = useRecoilState(selectedGenericGridRowState);
    const windowId = useMemo(() => window.command.getWindowId("Orders"), []);
    const loggerService = useRef(new LoggerService(OrdersApp.name)).current;

    useEffect(() =>
    {
        const webWorker = new Worker(new URL("../workers/order-reader.js", import.meta.url));
        setInboundWorker(webWorker);
        return () => webWorker.terminate();
    }, []);

    useEffect(() =>
    {
        const webWorker = new Worker(new URL("../workers/manage-order.js", import.meta.url));
        setOutboundWorker(webWorker);
        return () => webWorker.terminate();
    }, []);

    useEffect(() =>
    {
        if(selectedGenericGridRow)
            window.messenger.sendMessageToMain(FDC3Service.createOrderMenuContext({orderId: selectedGenericGridRow.orderId, orderState: selectedGenericGridRow.state}), null, windowId);

    }, [selectedGenericGridRow, windowId]);

    useEffect(() =>
    {
        const handler = ((fdc3Message, _, __) =>
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

            if (fdc3Message.type === 'order-action')
            {
                const { action, orderId } = fdc3Message;

                if(orderId !== selectedGenericGridRow.orderId)
                    return;

                if (action === 'DESK_APPROVE' || action === 'DESK_REJECT')
                {
                    loggerService.logInfo(`Order ${action} for order Id: ${orderId}`);
                    outboundWorker.postMessage({...selectedGenericGridRow, actionEvent: action});
                }

                if(action === 'slice')
                    setSliceDialogOpenFlag(true);
            }
        });

        window.messenger.handleMessageFromMain(handler);

        return () => window.messenger.removeHandlerForMessageFromMain(handler);

    }, [selectedGenericGridRow]);

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
        if (inboundWorker)
            inboundWorker.onmessage = handleWorkerMessage;

        return () =>
        {
            if (inboundWorker)
                inboundWorker.onmessage = null;
        };
    }, [inboundWorker]);

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
    }, [selectedContextShare, windowId]);

    const columnDefs = useMemo(() => ([
        {headerName: "Parent Order Id", field: "orderId", sortable: true, minWidth: 225, width: 225, filter: true},
        {headerName: "Qty", field: "quantity", sortable: true, minWidth: 90, width: 90, filter: true, headerTooltip: 'Original order quantity', valueFormatter: numberFormatter, sortingOrder: ['desc', 'asc']},
        {headerName: "Instrument", field: "instrumentCode", sortable: true, minWidth: 105, width: 105, filter: true},
        {headerName: "Side", field: "side", sortable: true, minWidth: 75, width: 75, filter: true, cellStyle: params => orderSideStyling(params.value)},
        {headerName: "Instrument Desc.", field: "instrumentDescription", hide: true, sortable: true, minWidth: 150, width: 150, filter: true},
        {headerName: "Px", field: "price", sortable: false, minWidth: 75, width: 75, filter: true, headerTooltip: 'Original order price', valueFormatter: numberFormatter},
        {headerName: "Client", field: "clientDescription", sortable: true, minWidth: 160, width: 160, filter: true},
        {headerName: "Destination", field: "destination", sortable: true, minWidth: 160, width: 160, filter: true},
        {headerName: "State", field: "state", sortable: true, minWidth: 135, width: 135, filter: true, cellStyle: params => orderStateStyling(params.value), valueFormatter: (params) => replaceUnderscoresWithSpace(params.value) },
        {headerName: "BLG", field: "blgCode", hide: true, sortable: true, minWidth: 85, width: 85, filter: true, headerTooltip: 'Bloomberg code of the order' },
        {headerName: "Owner", field: "ownerId", sortable: true, minWidth: 80, width: 80, headerTooltip: 'Current owner fo the order'},
        {headerName: "Instruction", field: "traderInstruction", sortable: true, minWidth: 110, width: 110, filter: true, headerTooltip: 'Trader instruction for the order' },
        {headerName: "CCY", field: "settlementCurrency", sortable: true, minWidth: 90, width: 90, filter: true, headerTooltip: 'Settlement currency of the order' },
        {headerName: "Exec Algo", field: "algoType", sortable: true, minWidth: 100, width: 100, filter: true, headerTooltip: 'Execution algorithm used for the order' },
        {headerName: "Arrived", field: "arrivalTime", sortable: true, minWidth: 90, width: 90, headerTooltip: 'Arrival time of the order'},
        {headerName: "Arr Px", field: "arrivalPrice", sortable: true, minWidth: 80, width: 80, headerTooltip: 'Arrival price of the order', valueFormatter: numberFormatter},
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
                <GenericGridComponent rowHeight={22} gridTheme={"ag-theme-alpine"} rowIdArray={["orderId"]} columnDefs={columnDefs} gridData={filterOrdersUsingContext} handleAction={null} sortModel={{ colId: 'arrivalTime', sort: 'desc' }}/>);
            </div>
        </div>
        <SliceDialog/>
    </>)

}
