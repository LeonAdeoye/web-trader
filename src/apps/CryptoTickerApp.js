import * as React from 'react';
import {useEffect, useMemo, useState, useRef, useCallback} from "react";
import {AgGridReact} from "ag-grid-react";
import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-alpine.css';
import {FDC3Service} from "../services/FDC3Service";
import {currencyFormatter, numberFormatter} from "../utilities";

export const CryptoTickerApp = ({webWorkerUrl}) =>
{
    const [prices, setPrices]  = useState([]);
    const [worker, setWorker] = useState(null);
    const gridApiRef = useRef();
    const gridDimensions = useMemo(() => ({ height: '100%', width: '100%' }), []);
    const defaultColDef = useMemo(() => ({resizable: true, filter: true, sortable: true}), []);
    const getRowId = useMemo(() => (row) => row.data.symbol, []);
    const windowId = useMemo(() => window.command.getWindowId("Grid Ticker"), []);

    const columnDefs = useMemo(() => ([
        {headerName: "Symbol", field: "symbol", maxWidth: 150, width: 150, pinned: "left", cellDataType: "text"},
        {headerName: "Best Ask", field: "best_ask", cellDataType: "number", valueFormatter: currencyFormatter, maxWidth: 140, width: 140},
        {headerName: "Best Bid", field: "best_bid", cellDataType: "number", valueFormatter: currencyFormatter, maxWidth: 140, width: 140},
        {headerName: "VWAP", field: "vwap_today", cellDataType: "number", valueFormatter: currencyFormatter, maxWidth: 150, width: 150},
        {headerName: "VWAP Last 24h", field: "vwap_24h", cellDataType: "number", valueFormatter: currencyFormatter, maxWidth: 150, width: 150},
        {headerName: "Low", field: "low", cellDataType: "number", valueFormatter: currencyFormatter, maxWidth: 140, width: 140},
        {headerName: "High", field: "high", cellDataType: "number", valueFormatter: currencyFormatter, maxWidth: 140, width: 140},
        {headerName: "Open", field: "open", cellDataType: "number", valueFormatter: currencyFormatter, maxWidth: 140, width: 140},
        {headerName: "Close", field: "close", cellDataType: "number", valueFormatter: currencyFormatter, maxWidth: 140, width: 140},
        {headerName: "Volume", field: "vol_today", cellDataType: "number", valueFormatter: numberFormatter, maxWidth: 150, width: 150},
        {headerName: "Volume Last 24h", field: "vol_24h", cellDataType: "number", valueFormatter: numberFormatter, maxWidth: 160, width: 160},
        {headerName: "Trades", field: "num_trades", cellDataType: "number", valueFormatter: numberFormatter, maxWidth: 130, width: 130},
        {headerName: "Trades Last 24h" , field: "num_trades_24h", cellDataType: "number", valueFormatter: numberFormatter, maxWidth: 150, width: 150}]), []);

    useEffect(() =>
    {
        // TODO: More refactoring required here.
        //  Use webWorkerUrl props instead of hard-coded URL. If I use props I'm getting an Uncaught DOMException:
        //  Failed to construct 'Worker': Script at 'file:///C:/Users/Leon%20Adeoye/development/web-trader/src/components/price-ticker-reader.js' cannot be accessed from origin 'http://localhost:3000'.
        const webWorker = new Worker(new URL("../workers/price-ticker-reader.js", import.meta.url));
        setWorker(webWorker);
        return () => webWorker.terminate();
    }, []);

    const onSelectionChanged = useCallback(() =>
    {
        const selectedRows = gridApiRef.current.api.getSelectedRows();
        let symbol = selectedRows.length === 0 ? null : selectedRows[0].symbol;
        window.messenger.sendMessageToMain(FDC3Service.createChartContext(symbol, 5), "Crypto Chart", "Crypto Ticker");
    }, []);

    const handleWorkerMessage = useCallback((event) =>
    {
        const { messageType, price: eventPrice } = event.data;
        setPrices(prevPrices =>
        {
            if (messageType === "update" && prevPrices.findIndex((price) => price.symbol === eventPrice.symbol) !== -1)
            {
                updateRows(eventPrice);
                return prevPrices; // No need to update prices state as updates are made to the grid directly. Updating the prices state will cause the grid to re-render.
            }
            return [...prevPrices, eventPrice]; // Update prices state only when a snapshot or new symbol update is received.
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

    const updateRows = useCallback((price) =>
    {
        gridApiRef.current.api.forEachNode((rowNode) =>
        {
            if (rowNode.data.symbol !== price.symbol)
                return;

            rowNode.updateData({...rowNode.data, ...price});
        });
    }, []);

    return (
        <div className={"ag-theme-alpine"} style={gridDimensions}>
            <AgGridReact
                ref={gridApiRef}
                columnDefs={columnDefs}
                rowData={prices}
                defaultColDef={defaultColDef}
                enableCellChangeFlash={true}
                rowSelection={'single'}
                onSelectionChanged={onSelectionChanged}
                animateRows={true}
                getRowId={getRowId}
                rowHeight={22}
                headerHeight={22}
            />
        </div>
    );
};
