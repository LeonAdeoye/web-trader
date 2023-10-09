import { AgGridReact } from 'ag-grid-react';
import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-alpine.css';
import React,{useEffect, useState, useRef, useCallback, useMemo} from "react";
import {Command} from "amps";
import {FDC3Service} from "../services/FDC3Service";
import TitleBarComponent from "../components/TitleBarComponent";

// In both cases we try to find the index of the existing row by using a matcher:
const matcher = ({ header }) => ({ key }) => key === header.sowKey();

// When AMPS notifies us that a message is no longer relevant, we remove that message from the grid.
// The processOOF function is declared outside the Grid component.
// Its main purpose to take an OOF message with current row data, and return new, adjusted row data:
const processOOF = (message, rowData) =>
{
    const rowIndex = rowData.findIndex(matcher(message));
    if(rowIndex >= 0)
    {
        const rows = rowData.filter(({ key }) => key !== message.header.sowKey());
        return rows;
    }
    return rowData;
}

// On the other side, when AMPS notifies us that new information has arrived,
// we use the data in that message to update the grid. Similar to processOOF,
// the processPublish function is declared outside the Grid component,
// takes a message and current row data and returns new row data:
const processPublish = (message, rowData) =>
{
    const rowIndex = rowData.findIndex(matcher(message));
    const rows = rowData.slice();
    if(rowIndex >= 0)
    {
        rows[rowIndex] = { ...rows[rowIndex], ...message.data };
    }
    else
    {
        message.data.key = message.header.sowKey();
        rows.push(message.data);
    }
    return rows;
}

export const StockTickerApp = ({client}) =>
{
    const columnDefs = useMemo(() => ([
        {headerName: 'Stock Code', field: 'stockCode'},
        {headerName: 'Bid', field: 'bid',sort: 'desc'},
        {headerName: 'Ask', field: 'ask'}
    ]), []);

    const [rowData, setRowData] = useState([]);
    const [, setWorker] = useState(null);
    const [stockCode, setStockCode] = useState(null);

    // Used for context sharing between child windows.
    const windowId = useMemo(() => window.command.getWindowId("stock-ticker"), []);

    // Keep a reference to the subscription ID.
    const subIdTef = useRef();
    const gridApiRef = useRef();

    useEffect(() =>
    {
        return () =>
        {
            // If there is an active subscription at the time of subscription then remove it.
            if(subIdTef.current)
                client.unsubscribe(subIdTef.current);
        }
    }, [client]);

    useEffect(() =>
    {
        window.messenger.handleMessageFromMain((fdc3Message, _, __) =>
        {
            if(fdc3Message.type === "fdc3.context")
            {
                if(fdc3Message.instruments.length > 0 && fdc3Message.instruments[0].id.ticker)
                    setStockCode(fdc3Message.instruments[0].id.ticker);
                else
                    setStockCode(null);
            }
        });
    }, []);

    useEffect(() =>
    {
        const web_worker = new Worker(new URL("../workers/market-data.js", import.meta.url));
        setWorker(web_worker);
        return () => web_worker.terminate();
    }, []);

    const filterTicksUsingContext = useMemo(() =>
    {
        if(stockCode)
            return rowData.filter(tick => tick.stockCode === stockCode);
        else
            return rowData;

    }, [stockCode, rowData]);

    const onSelectionChanged = useCallback(() =>
    {
        const selectedRows = gridApiRef.current.api.getSelectedRows();
        let stockCode = selectedRows.length === 0 ? null : selectedRows[0].stockCode;
        window.messenger.sendMessageToMain(FDC3Service.createContextShare(stockCode, null), null, windowId);
    }, []);

    return (
        <div>
            <TitleBarComponent title="Stock Ticker" windowId={windowId} addButtonProps={undefined} showChannel={true} showTools={false}/>
            <div className="ag-theme-alpine" style={{ width: '100%', height: 'calc(100vh - 65px)', float: 'left', padding: '0px', margin:'45px 0px 0px 0px'}}>
                <AgGridReact
                    columnDefs={columnDefs}
                    ref={gridApiRef}
                    rowSelection={'single'}
                    onSelectionChanged={onSelectionChanged}
                    rowHeight={25}
                    // we now use state to track row data changes
                    rowData={filterTicksUsingContext}
                    // unique identification of the row based on the SowKey
                    getRowId={({data: { key }}) => key}
                    // resize columns on grid resize
                    onGridSizeChanged={({ api }) => api.sizeColumnsToFit()}
                    // provide callback to invoke once grid is initialised.
                    onGridReady={ async (api) =>
                    {
                        const command = new Command('sow_and_subscribe');
                        command.topic('market_data');
                        command.orderBy('/bid DESC');
                        command.options('oof, conflation=3000ms, top_n=20, skip_n=0');

                        try
                        {
                            let rows;
                            subIdTef.current = await client.execute(command, message =>
                            {
                                switch(message.header.command())
                                {
                                    // Begin receiving the initial dataset.
                                    case 'group_begin':
                                        rows = [];
                                        break;
                                    // This message is part of the initial snapshot.
                                    case 'sow':
                                        message.data.key = message.header.sowKey();
                                        rows.push(message.data);
                                        break;
                                    // Thr initial snapshot has been delivered.
                                    case 'group_end':
                                        setRowData(rows);
                                        break;
                                    // Out-of-focus -- a message should no longer be in the group.
                                    case 'oof':
                                        rows = processOOF(message, rows);
                                        setRowData(rows);
                                        break;
                                    // Either a new message or an update.
                                    default:
                                        rows = processPublish(message, rows);
                                        setRowData(rows);
                                }
                            });
                        }
                        catch(err)
                        {
                            setRowData([]);
                            console.error(err);
                        }
                    }}
                />
            </div>
        </div>
    );
};

