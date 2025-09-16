import * as React from 'react';
import {GenericGridComponent} from "../components/GenericGridComponent";
import {useEffect, useState, useCallback, useMemo, useRef} from "react";
import {numberFormatter, orderSideStyling, orderStateStyling, replaceUnderscoresWithSpace} from "../utilities";
import {useRecoilState} from "recoil";
import {selectedContextShareState, selectedGenericGridRowState, titleBarContextShareColourState} from "../atoms/component-state";
import {sliceDialogDisplayState, batchOrderUploadDialogDisplayState} from "../atoms/dialog-state";
import {FDC3Service} from "../services/FDC3Service";
import TitleBarComponent from "../components/TitleBarComponent";
import {LoggerService} from "../services/LoggerService";
import SliceDialog from "../dialogs/SliceDialog";
import BatchOrderUploadDialog from "../dialogs/BatchOrderUploadDialog";
import {ExchangeRateService} from "../services/ExchangeRateService";
import {OrderService} from "../services/OrderService";
import {ServiceRegistry} from "../services/ServiceRegistry";
import { TabContext, TabList, TabPanel } from '@mui/lab';
import { Tab } from '@mui/material';
import '../styles/sass/orders-app.scss';

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
    const [, setBatchOrderUploadDialogOpenFlag] = useRecoilState(batchOrderUploadDialogDisplayState);
    const [selectedGenericGridRow] = useRecoilState(selectedGenericGridRowState);
    const windowId = useMemo(() => window.command.getWindowId("Orders"), []);
    const loggerService = useRef(new LoggerService(OrdersApp.name)).current;
    const exchangeRateService = useRef(new ExchangeRateService()).current;
    const orderService = useRef(new OrderService()).current;
    const [ownerId, setOwnerId] = useState('');
    const [selectedTab, setSelectedTab] = useState('0');

    const handleTabChange = useCallback((event, newValue) =>
    {
        setSelectedTab(newValue);
    }, []);

    useEffect(() =>
    {
        const loadOwner = async () =>  setOwnerId(await window.configurations.getLoggedInUserId());
        loadOwner();
    }, []);

    const filteredOrders = useMemo(() =>
    {
        if (!orders || orders.length === 0)
            return [];

        let tabFilteredOrders;
        switch (selectedTab)
        {
            case '0':
                tabFilteredOrders = orders.filter(order =>
                    order.state === 'NEW_ORDER' || order.state === 'PENDING_NEW'
                    || order.state === 'ACCEPTED_BY_OMS' || order.state === 'REJECTED_BY_OMS');
                break;
            case '1':
                tabFilteredOrders = orders.filter(order => order.ownerId === ownerId
                    && order.state !== 'NEW_ORDER' && order.state !== 'PENDING_NEW'
                    && order.state !== 'ACCEPTED_BY_OMS' && order.state !== 'REJECTED_BY_OMS');
                break;
            case '2':
                tabFilteredOrders = orders.filter(order => order.ownerId !== ownerId
                    && order.state !== 'NEW_ORDER' && order.state !== 'PENDING_NEW'
                    && order.state !== 'ACCEPTED_BY_OMS' && order.state !== 'REJECTED_BY_OMS');
                break;
            default:
                tabFilteredOrders = orders;
        }

        if(instrumentCode && clientCode)
            return tabFilteredOrders.filter((order) => order.instrumentCode === instrumentCode && order.clientCode === clientCode);
        else if(instrumentCode)
            return tabFilteredOrders.filter((order) => order.instrumentCode === instrumentCode);
        else if(clientCode)
            return tabFilteredOrders.filter((order) => order.clientCode === clientCode);
        else
            return tabFilteredOrders;
    }, [orders, selectedTab, ownerId, instrumentCode, clientCode]);



    useEffect(() =>
    {
        const loadData = async () =>
        {
            await exchangeRateService.loadExchangeRates();
        };
        loadData().then(() => loggerService.logInfo("Reference loaded in SliceDialog"));
    }, [exchangeRateService]);

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

                if(action === 'SUBMIT_TO_EXCH')
                {
                    const index = orders.findIndex((element) => element.orderId === orderId);
                    if (index === -1) return;

                    const currentOrder = orders[index];
                    const currentSliced = currentOrder.sliced || 0;
                    const totalAfterSlice = currentSliced + currentOrder.quantity;

                    if (totalAfterSlice > currentOrder.quantity)
                    {
                        const message = `Order with order Id: ${currentOrder.orderId} cannot be sliced because the slice quantity: ${totalAfterSlice} exceeds the original order quantity of ${currentOrder.quantity}`;
                        loggerService.logInfo(message);
                        alert(message);
                        return;
                    }

                    setOrders((prevData) =>
                    {
                        const updatedData = [...prevData];
                        updatedData[index] = { ...currentOrder, sliced: totalAfterSlice };
                        return updatedData;
                    });

                    const usdPrice = selectedGenericGridRow.settlementCurrency === 'USD' ? selectedGenericGridRow.price
                        : exchangeRateService.convert(selectedGenericGridRow.price, selectedGenericGridRow.settlementCurrency, 'USD');

                    const childOrder = orderService.createChildOrder(selectedGenericGridRow, selectedGenericGridRow.quantity,
                        selectedGenericGridRow.quantity, selectedGenericGridRow.price, usdPrice, selectedGenericGridRow.destination);

                    loggerService.logInfo(`Sending 100% of order for order Id: ${selectedGenericGridRow.orderId}`);
                    outboundWorker.postMessage(childOrder);
                }

                if(action == 'DESK_DONE')
                {
                    loggerService.logInfo(`Order marked as done for the day for order Id: ${selectedGenericGridRow.orderId}`);
                    outboundWorker.postMessage({...selectedGenericGridRow, actionEvent: 'DESK_DONE'});
                }
            }
        });

        window.messenger.handleMessageFromMain(handler);

        return () => window.messenger.removeHandlerForMessageFromMain(handler);

    }, [selectedGenericGridRow]);

    const handleWorkerMessage = useCallback((event) =>
    {
        const incomingOrder = event.data.order;

        if(orderService.isChildOrder(incomingOrder))
            return;

        setOrders((prevData) =>
        {
            incomingOrder.executedNotionalValueInUSD = exchangeRateService.convert(incomingOrder.executedNotionalValueInLocal, incomingOrder.settlementCurrency, 'USD').toFixed(2);
            incomingOrder.residualNotionalValueInUSD = exchangeRateService.convert(incomingOrder.residualNotionalValueInLocal, incomingOrder.settlementCurrency, 'USD').toFixed(2);
            incomingOrder.orderNotionalValueInUSD = exchangeRateService.convert(incomingOrder.orderNotionalValueInLocal, incomingOrder.settlementCurrency, 'USD').toFixed(2);

            const index = prevData.findIndex((element) => element.orderId === incomingOrder.orderId);
            if (index !== -1)
            {
                const updatedData = [...prevData];
                updatedData[index] = incomingOrder;
                return updatedData;
            }
            else
                return [...prevData, incomingOrder];
        });

    }, [exchangeRateService, orderService]);

    const handleSendSlice = (childOrders) =>
    {
        childOrders.forEach((childOrder) =>
        {
            loggerService.logInfo(`Sending child order with Id: ${childOrder.orderId} to OMS`)
            outboundWorker.postMessage(childOrder);
        });
    }

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
        {headerName: "Arrived", field: "arrivalTime", sortable: true, minWidth: 110, width: 110, headerTooltip: 'Arrival time of the order'},
        {headerName: "Parent Order Id", field: "orderId", sortable: true, minWidth: 225, width: 225, filter: true},
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
        {headerName: "Arr Px", field: "arrivalPrice", sortable: true, minWidth: 80, width: 80, headerTooltip: 'Arrival price of the order', valueFormatter: numberFormatter},
        {headerName: "Avg Px", field: "averagePrice", sortable: true, minWidth: 80, width: 80, filter: false, headerTooltip: 'Average executed price', valueFormatter: numberFormatter},
        {headerName: "Qty", field: "quantity", sortable: true, minWidth: 90, width: 90, filter: true, headerTooltip: 'Original order quantity', valueFormatter: numberFormatter, sortingOrder: ['desc', 'asc']},
        {headerName: "Sliced", field: "sliced", sortable: true, minWidth: 90, width: 90, filter: false, headerTooltip: 'Sliced quantity', valueFormatter: numberFormatter},
        {headerName: "Pending", field: "pending", sortable: true, minWidth: 90, width: 90, filter: false, headerTooltip: 'Pending quantity', valueFormatter: numberFormatter},
        {headerName: "Executed", field: "executed", sortable: true, minWidth: 90, width: 90, filter: false, headerTooltip: 'Executed quantity', valueFormatter: numberFormatter},
        {headerName: "$Exec Notional", field: "executedNotionalValueInUSD", sortable: true, minWidth: 110, width: 110, filter: false, headerTooltip: 'Executed notional value in USD', valueFormatter: numberFormatter},
        {headerName: "Exec Notional", field: "executedNotionalValueInLocal", sortable: true, minWidth: 110, width: 110, filter: false, headerTooltip: 'Executed notional value in settlement currency', valueFormatter: numberFormatter},
        {headerName: "$Order Notional", field: "orderNotionalValueInUSD", sortable: true, minWidth: 110, width: 110, filter: false, headerTooltip: 'Original order notional value in USD', valueFormatter: numberFormatter},
        {headerName: "Order Notional", field: "orderNotionalValueInLocal", sortable: true, minWidth: 110, width: 110, filter: false, headerTooltip: 'Original order notional value in settlement currency', valueFormatter: numberFormatter},
        {headerName: "$Resid. Notional", field: "residualNotionalValueInUSD", sortable: true, minWidth: 110, width: 110, filter: false, headerTooltip: 'Residual notional value in USD', valueFormatter: numberFormatter},
        {headerName: "Resid. Notional", field: "residualNotionalValueInLocal", sortable: true, minWidth: 110, width: 110, filter: false, headerTooltip: 'Residual notional value in settlement currency', valueFormatter: numberFormatter},
        {headerName: "Exec Algo", field: "algoType", sortable: true, hide: true, minWidth: 100, width: 100, filter: true, headerTooltip: 'Execution algorithm used for the order' },
        {headerName: "ADV20", field: "adv20", hide: true, sortable: true, minWidth: 85, width: 85, filter: true, headerTooltip: 'Average daily volume over the last 20 days'},
        {headerName: "Exec Trg", field: "executionTrigger", hide: true, sortable: true, minWidth: 130, width: 130, filter: true},
        {headerName: "IVWAP", field: "ivwap", headerTooltip: 'Interval VWAP', hide: true, sortable: false, minWidth: 100, width: 100, filter: false, valueFormatter: numberFormatter},
        {headerName: "Perf Arrival", field: "performanceVsArrival", headerTooltip: 'Performance versus arrival in USD', hide: true, sortable: false, minWidth: 100, width: 110, filter: false, valueFormatter: numberFormatter},
        {headerName: "Perf Arrival (bps)", field: "performanceVsArrivalBPS", headerTooltip: 'Performance versus arrival in bps', hide: true, sortable: false, minWidth: 100, width: 130, filter: false},
        {headerName: "Perf IVWAP", field: "performanceVsIVWAP", headerTooltip: 'Performance versus interval VWAP in USD', hide: true, sortable: false, minWidth: 100, width: 110, filter: false, valueFormatter: numberFormatter},
        {headerName: "Perf IVWAP (bps)", field: "performanceVsIVWAPBPS", headerTooltip: 'Performance versus interval VWAP in bps', hide: true, sortable: false, minWidth: 100, width: 120, filter: false},
    ]), []);

    const launchBatchUpload = useCallback(() =>
    {
        setBatchOrderUploadDialogOpenFlag({open: true, clear: false});
    }, [setBatchOrderUploadDialogOpenFlag]);

    const handleBatchOrderSubmit = useCallback(async (orders) =>
    {
        try
        {
            loggerService.logInfo(`Submitting ${orders.length} batch orders`);
            for (const orderData of orders)
            {
                const instrumentService = ServiceRegistry.getInstrumentService();
                const instrument = instrumentService.getInstrumentByCode(orderData.instrumentCode);
                const clientService = ServiceRegistry.getClientService();
                const client = clientService.getClientByCode(orderData.clientCode);
                const quantity = parseFloat(orderData.quantity);
                const price = parseFloat(orderData.price);
                const notionalValueInLocal = quantity * price;
                const notionalValueInUSD = exchangeRateService.convert(notionalValueInLocal, instrument?.settlementCurrency || 'USD', 'USD');
                const parentOrderId = crypto.randomUUID();
                const order =
                {
                    orderId: parentOrderId,
                    parentOrderId: parentOrderId,
                    instrumentCode: orderData.instrumentCode,
                    instrumentDescription: instrument?.instrumentDescription || '',
                    side: orderData.side,
                    clientCode: orderData.clientCode,
                    clientDescription: client?.clientDescription || client?.clientName || '',
                    quantity: quantity,
                    price: price,
                    sliced: 0,
                    pending: quantity,
                    executed: 0,
                    arrivalTime: new Date().toLocaleTimeString(),
                    arrivalPrice: price,
                    state: 'NEW_ORDER',
                    ownerId: ownerId,
                    settlementCurrency: instrument?.settlementCurrency || 'USD',
                    settlementType: instrument?.settlementType || 'CASH',
                    destination: orderData.destination || 'DMA',
                    traderInstruction: orderData.traderInstruction || '',
                    priceType: 2,
                    tif: 0,
                    orderNotionalValueInLocal: notionalValueInLocal,
                    orderNotionalValueInUSD: notionalValueInUSD,
                    executedNotionalValueInLocal: 0,
                    executedNotionalValueInUSD: 0,
                    residualNotionalValueInLocal: notionalValueInLocal,
                    residualNotionalValueInUSD: notionalValueInUSD,
                    assetType: instrument?.assetType || '',
                    blgCode: instrument?.blgCode || '',
                    ric: instrument?.ric || '',
                    exchangeAcronym: instrument?.exchangeAcronym || '',
                    lotSize: instrument?.lotSize || 1,
                    originalSource: "WEB_TRADER",
                    currentSource: "WEB_TRADER",
                    targetSource: "ORDER_MANAGEMENT_SERVICE",
                    messageType: 'PARENT_ORDER',
                    version: 1,
                    executedTime: '',
                    percentageOfParentOrder: 100.0,
                    tradeDate: new Date().toLocaleDateString(),
                    qualifier: 'C:2',
                    accountMnemonic: '',
                    accountName: '',
                    legalEntity: '',
                    isFirmAccount: false,
                    isRiskAccount: false,
                    customFlags: '',
                    brokerAcronym: '',
                    brokerDescription: '',
                    handlingInstruction: '',
                    algoType: '',
                    facilConsent: false,
                    facilConsentDetails: '',
                    facilInstructions: '',
                    averagePrice: 0,
                    actionEvent: 'SUBMIT_TO_OMS'
                };
                outboundWorker.postMessage(order);
            }
            loggerService.logInfo(`Successfully submitted ${orders.length} batch orders`);
        }
        catch (error)
        {
            loggerService.logError(`Failed to submit batch orders: ${error.message}`);
        }
    }, [loggerService, outboundWorker, exchangeRateService, ownerId]);

    return (<>
            <TitleBarComponent title="Orders" windowId={windowId} addButtonProps={{ handler: () => launchBatchUpload(), tooltipText: "Upload batch orders..." }}  showChannel={true} showTools={false}/>
            <div style={{ width: '100%', height: 'calc(100vh - 75px)', float: 'left', padding: '0px', margin:'45px 0px 0px 0px'}}>
                <div className="orders-app">
                    <TabContext value={selectedTab}>
                        <TabList onChange={handleTabChange} className="orders-tab-list">
                            <Tab 
                                label="Incoming Orders" 
                                value="0" 
                                className="incoming-orders-tab"
                                sx={{ 
                                    marginRight: "5px", 
                                    minHeight: "25px", 
                                    height: "25px", 
                                    backgroundColor: "#bdbaba", 
                                    color: "white", 
                                    '&.Mui-selected': {
                                        backgroundColor: '#656161', 
                                        color: "white"
                                    }
                                }}/>
                            <Tab 
                                label="My Orders" 
                                value="1" 
                                className="my-orders-tab"
                                sx={{ 
                                    minHeight: "25px", 
                                    height: "25px", 
                                    backgroundColor: "#bdbaba", 
                                    color: "white", 
                                    '&.Mui-selected': {
                                        backgroundColor: '#656161', 
                                        color: "white"
                                    }
                                }}/>
                            <Tab 
                                label="Desk's Orders" 
                                value="2" 
                                className="desk-orders-tab"
                                sx={{ 
                                    minHeight: "25px", 
                                    height: "25px", 
                                    backgroundColor: "#bdbaba", 
                                    color: "white", 
                                    '&.Mui-selected': {
                                        backgroundColor: '#656161', 
                                        color: "white"
                                    }
                                }}/>
                        </TabList>
                        <TabPanel value="0" className="incoming-orders">
                            <div className="ag-theme-alpine" style={{ height: 'calc(100vh - 120px)', width: '100%' , padding: '0px', margin:'0px'}}>
                                <GenericGridComponent 
                                    rowHeight={22} 
                                    gridTheme={"ag-theme-alpine"} 
                                    rowIdArray={["orderId"]} 
                                    columnDefs={columnDefs} 
                                    gridData={filteredOrders} 
                                    handleAction={null} 
                                    sortModel={{ colId: 'arrivalTime', sort: 'desc' }}/>
                            </div>
                        </TabPanel>
                        
                        <TabPanel value="1" className="my-orders">
                            <div className="ag-theme-alpine" style={{ height: 'calc(100vh - 120px)', width: '100%' , padding: '0px', margin:'0px'}}>
                                <GenericGridComponent 
                                    rowHeight={22} 
                                    gridTheme={"ag-theme-alpine"} 
                                    rowIdArray={["orderId"]} 
                                    columnDefs={columnDefs} 
                                    gridData={filteredOrders} 
                                    handleAction={null} 
                                    sortModel={{ colId: 'arrivalTime', sort: 'desc' }}/>
                            </div>
                        </TabPanel>
                        
                        <TabPanel value="2" className="desk-orders">
                            <div className="ag-theme-alpine" style={{ height: 'calc(100vh - 120px)', width: '100%' , padding: '0px', margin:'0px'}}>
                                <GenericGridComponent 
                                    rowHeight={22} 
                                    gridTheme={"ag-theme-alpine"} 
                                    rowIdArray={["orderId"]} 
                                    columnDefs={columnDefs} 
                                    gridData={filteredOrders} 
                                    handleAction={null} 
                                    sortModel={{ colId: 'arrivalTime', sort: 'desc' }}/>
                            </div>
                        </TabPanel>
                    </TabContext>
                </div>
            </div>
            <SliceDialog handleSendSlice={handleSendSlice}/>
            <BatchOrderUploadDialog closeHandler={handleBatchOrderSubmit}/>
        </>)
}
