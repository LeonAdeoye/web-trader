import * as React from 'react';
import {GenericGridComponent} from "../components/GenericGridComponent";
import {useEffect, useState, useCallback, useMemo} from "react";
import {numberFormatter} from "../utilities";
import {useRecoilState} from "recoil";
import {selectedContextShareState, titleBarContextShareColourState} from "../atoms/component-state";
import {FDC3Service} from "../services/FDC3Service";
import TitleBarComponent from "../components/TitleBarComponent";
import {alertDialogDisplayState} from "../atoms/dialog-state";

export const AlertsApp = () =>
{
    const [alerts, setAlerts] = useState([]);
    const [worker, setWorker] = useState(null);
    const [stockCode, setStockCode] = useState(null);
    const [client, setClient] = useState(null);
    const [selectedContextShare] = useRecoilState(selectedContextShareState);
    const [, setAlertDialogDisplayFlag] = useRecoilState(alertDialogDisplayState);
    const [, setTitleBarContextShareColour] = useRecoilState(titleBarContextShareColourState);

    // Used for context sharing between child windows.
    const windowId = useMemo(() => window.command.getWindowId("Alerts"), []);

    useEffect(() =>
    {
        const webWorker = new Worker(new URL("../workers/alert-reader.js", import.meta.url));
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

    const filterAlertsUsingContext = useMemo(() =>
    {
        if(stockCode && client)
            return alerts.filter((alert) => alert.stockCode === stockCode && alert.client === client);
        else if(stockCode)
            return alerts.filter((alert) => alert.stockCode === stockCode);
        else if(client)
            return alerts.filter((alert) => alert.client === client);
        else
            return alerts;

    }, [alerts, stockCode, client]);

    useEffect(() =>
    {
        if(selectedContextShare.length === 1)
        {
            if(selectedContextShare[0].contextShareKey === 'stockCode')
                window.messenger.sendMessageToMain(FDC3Service.createContextShare(selectedContextShare[0].contextShareValue, null), null, windowId);
            else
                window.messenger.sendMessageToMain(FDC3Service.createContextShare(null, selectedContextShare[0].contextShareValue), null, windowId);
        }
        else if(selectedContextShare.length == 2)
        {
            const stockCode = selectedContextShare.find((contextShare) => contextShare.contextShareKey === 'stockCode').contextShareValue;
            const client = selectedContextShare.find((contextShare) => contextShare.contextShareKey === 'client').contextShareValue;
            window.messenger.sendMessageToMain(FDC3Service.createContextShare(stockCode, client), null, windowId);
        }
    }, [selectedContextShare]);

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

    const columnDefs = useMemo(() => ([
        {headerName: "Id", field: "id", hide: true, sortable: false, minWidth: 130, width: 130},
        {headerName: "Type", field: "type", sortable: true, minWidth: 170, width: 170, filter: true},
        {headerName: "Alert Details", field: "alertDetails", sortable: true, minWidth: 400, width: 400, filter: true},
        {headerName: "Time", field: "time", sortable: true, minWidth: 90, width: 90},
        {headerName: "Priority", field: "priority", sortable: true, minWidth: 100, width: 100, filter: true},
        {headerName: "Client", field: "client", sortable: true, minWidth: 100, width: 250, filter: true},
        {headerName: "Order Id", field: "orderId", sortable: true, minWidth: 100, width: 150, filter: true},
        {headerName: "Order State", field: "orderState", sortable: true, minWidth: 130, width: 130, filter: true},
        {headerName: "StockCode", field: "stockCode", sortable: true, minWidth: 100, width: 100, filter: true},
        {headerName: "Side", field: "side", sortable: true, minWidth: 90, width: 90, filter: true},
        {headerName: "Px", field: "price", sortable: false, minWidth: 100, width: 100, filter: true, headerTooltip: 'Original order price'},
        {headerName: "Pending", field: "pending", sortable: true, minWidth: 100, width: 120, filter: false, headerTooltip: 'Pending quantity', valueFormatter: numberFormatter},
        {headerName: "Executed", field: "executed", sortable: true, minWidth: 100, width: 120, filter: false, headerTooltip: 'Executed quantity', valueFormatter: numberFormatter},
        {headerName: "Avg Px", field: "averagePrice", sortable: true, minWidth: 100, width: 100, filter: false, headerTooltip: 'Average executed price', valueFormatter: numberFormatter},
        {headerName: "Notional USD", field: "notionalValue", sortable: true, minWidth: 140, width: 140, filter: false, headerTooltip: 'Notional value in USD', valueFormatter: numberFormatter}
    ]), []);

    return (
        <div>
            <TitleBarComponent title="Alerts" windowId={windowId} addButtonProps={{
                handler:  () => setAlertDialogDisplayFlag(true),
                tooltipText: "Add new alert..."
            }} showChannel={true} showTools={false}/>
            <div style={{ width: '100%', height: 'calc(100vh - 65px)', float: 'left', padding: '0px', margin:'45px 0px 0px 0px'}}>
                <GenericGridComponent rowHeight={22}
                                      gridTheme={"ag-theme-alpine"}
                                      rowIdArray={["id"]}
                                      columnDefs={columnDefs}
                                      gridData={filterAlertsUsingContext}/>
            </div>
        </div>);
};
