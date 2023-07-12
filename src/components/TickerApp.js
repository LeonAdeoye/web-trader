import * as React from 'react';
import {useCallback, useEffect, useMemo, useState} from "react";
import { AgGridReact} from "ag-grid-react";
import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-alpine.css';

export const TickerApp = (factory, deps) =>
{
    const [prices, setPrices]  = useState([]);
    const [worker, setWorker] = useState(null);

    const [columnDefs, setColumnDefs] = useState([
        {headerName: "Symbol", field: "symbol", resizable: true},
        {headerName: "Best Ask", field: "best_ask", resizable: true, cellDataType: "number"},
        {headerName: "Best Bid", field: "best_bid", resizable: true, cellDataType: "number"},
        {headerName: "VWAP", field: "vwap_today", resizable: true, cellDataType: "number"},
        {headerName: "VWAP Last 24h", field: "vwap_24h", resizable: true, cellDataType: "number"},
        {headerName: "Low", field: "low", resizable: true, cellDataType: "number"},
        {headerName: "High", field: "high", resizable: true, cellDataType: "number"},
        {headerName: "Open", field: "open", resizable: true, cellDataType: "number"},
        {headerName: "Close", field: "close", resizable: true, cellDataType: "number"},
        {headerNAme: "Volume", field: "vol_today", resizable: true, cellDataType: "number"},
        {headerName: "Volume Last 24h", field: "vol_24h", resizable: true, cellDataType: "number"},
        {headerName: "Trades", field: "num_trades", resizable: true, cellDataType: "number"},
        {headerName: "Trades Last 24h" , field: "num_trades_24h", resizable: true, cellDataType: "number"}]);

    const defaultColDef = useMemo(() => ({filter: true, sortable: true}));

    const celClickedListener = useCallback( event => {
        console.log(event);
    });

    useEffect(() =>
    {
        const web_worker = new Worker(new URL("./price-reader.js", import.meta.url));
        setWorker(web_worker);
        return () =>
        {
            web_worker.terminate();
        };
    }, []);

    useEffect(() =>
    {
        if(worker)
        {
            worker.onmessage = (e) =>
            {
                setPrices((prices) => [...prices, e.data]);
            };
        }
    }, [worker]);

    return (
        <div className="ag-theme-alpine" style={{height: '100%', width: '100%'}}>
            <AgGridReact
                columnDefs={columnDefs}
                rowData={prices}
                defaultColDef={defaultColDef}
                onCellClicked={celClickedListener}
            />
        </div>
    );
};
