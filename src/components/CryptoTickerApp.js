import * as React from 'react';
import {useEffect, useMemo, useState, useRef, useCallback} from "react";
import {AgGridReact} from "ag-grid-react";
import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-alpine.css';
import {useRecoilState} from "recoil";
import {selectedCurrencyState} from "./currency-state";

export const CryptoTickerApp = () =>
{
    const [prices, setPrices]  = useState([]);
    const [worker, setWorker] = useState(null);
    const gridApiRef = useRef();
    const gridDimensions = useMemo(() => ({ height: '100%', width: '100%' }), []);
    const [selectedCurrency, setSelectedCurrency] = useRecoilState(selectedCurrencyState);

    const isValidParameter = (parameter) =>
    {
        if(parameter === null || parameter === undefined)
            return false;

        if(parameter.value === null || parameter.value === undefined || parameter.value === '')
            return false;

        return true;
    }

    const formatNumber = (number) =>
    {
        return number.toString().replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,');
    }
    const numberFormatter = (param) =>
    {
        return isValidParameter(param) ? formatNumber(param.value) : param.value;
    }

    const currencyFormatter = (param) =>
    {
        return isValidParameter(param) ? "$" + formatNumber(param.value) : param.value;
    }

    const [columnDefs] = useState([
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
        {headerName: "Trades Last 24h" , field: "num_trades_24h", cellDataType: "number", valueFormatter: numberFormatter, maxWidth: 150, width: 150}]);

    const defaultColDef = useMemo(() => ({resizable: true, filter: true, sortable: true}), []);

    const getRowId = useMemo(() => (row) => row.data.symbol, []);

    useEffect(() =>
    {
        const web_worker = new Worker(new URL("./price-ticker-reader.js", import.meta.url));
        setWorker(web_worker);
        return () => web_worker.terminate();
    }, []);

    const onSelectionChanged = useCallback(() =>
    {
        console.log("onSelectionChanged");
        const selectedRows = gridApiRef.current.api.getSelectedRows();
        setSelectedCurrency(selectedRows.length === 0 ? null : selectedRows[0].symbol);
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
        {
            gridApiRef.current.api.setHeaderHeight(25);
            worker.onmessage = handleWorkerMessage;
        }

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
        <div className="ag-theme-alpine" style={gridDimensions}>
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
                rowHeight={25}
            />
        </div>
    );
};
