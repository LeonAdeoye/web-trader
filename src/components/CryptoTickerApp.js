import * as React from 'react';
import {useEffect, useMemo, useState, useRef, useCallback} from "react";
import {AgGridReact} from "ag-grid-react";
import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-alpine.css';

export const CryptoTickerApp = () =>
{
    const [prices, setPrices]  = useState([]);
    const [worker, setWorker] = useState(null);
    const gridApiRef = useRef();
    const gridDimensions = useMemo(() => ({ height: '100%', width: '100%' }), []);

    const timestampToHHMMSS = (timestamp) =>
    {
        const date = new Date(timestamp);
        const hours = date.getHours().toString().padStart(2, '0');
        const minutes = date.getMinutes().toString().padStart(2, '0');
        const seconds = date.getSeconds().toString().padStart(2, '0');
        return `${hours}:${minutes}:${seconds}`;
    }

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
        {headerName: "Symbol", field: "symbol", maxWidth: 200, width: 200, pinned: "left", cellDataType: "text"},
        {headerName: "Best Ask", field: "best_ask", cellDataType: "number", valueFormatter: currencyFormatter, maxWidth: 160, width: 160},
        {headerName: "Best Bid", field: "best_bid", cellDataType: "number", valueFormatter: currencyFormatter, maxWidth: 160, width: 160},
        {headerName: "VWAP", field: "vwap_today", cellDataType: "number", valueFormatter: currencyFormatter},
        {headerName: "VWAP Last 24h", field: "vwap_24h", cellDataType: "number", valueFormatter: currencyFormatter},
        {headerName: "Low", field: "low", cellDataType: "number", valueFormatter: currencyFormatter},
        {headerName: "High", field: "high", cellDataType: "number", valueFormatter: currencyFormatter},
        {headerName: "Open", field: "open", cellDataType: "number", valueFormatter: currencyFormatter},
        {headerName: "Close", field: "close", cellDataType: "number", valueFormatter: currencyFormatter},
        {headerName: "Volume", field: "vol_today", cellDataType: "number", valueFormatter: numberFormatter},
        {headerName: "Volume Last 24h", field: "vol_24h", cellDataType: "number", valueFormatter: numberFormatter},
        {headerName: "Trades", field: "num_trades", cellDataType: "number", valueFormatter: numberFormatter},
        {headerName: "Trades Last 24h" , field: "num_trades_24h", cellDataType: "number", valueFormatter: numberFormatter}]);

    const defaultColDef = useMemo(() => ({resizable: true, filter: true, sortable: true}), []);

    const getRowId = useMemo(() => (row) => row.data.symbol, []);

    useEffect(() =>
    {
        const web_worker = new SharedWorker(new URL("./price-reader.js", import.meta.url));
        setWorker(web_worker);
        return () => web_worker.terminate();
    }, []);

    const handleWorkerMessage = (event) =>
    {
        const { messageType, price: eventPrice } = event.data;
        eventPrice.timeHHMMSS = timestampToHHMMSS(eventPrice.timestamp);
        setPrices(prevPrices =>
        {
            if (messageType === "update" && prevPrices.findIndex((price) => price.symbol === eventPrice.symbol) !== -1)
            {
                updateRows(eventPrice);
                console.log(eventPrice);
                return prevPrices; // No need to update prices state as updates are made to the grid directly. Updating the prices state will cause the grid to re-render.
            }
            return [...prevPrices, eventPrice]; // Update prices state only when a snapshot or new symbol update is received.
        });
    };

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
        <div className="ag-theme-alpine-dark" style={gridDimensions}>
            <AgGridReact
                ref={gridApiRef}
                columnDefs={columnDefs}
                rowData={prices}
                defaultColDef={defaultColDef}
                enableCellChangeFlash={true}
                animateRows={true}
                getRowId={getRowId}
                rowHeight={25}
            />
        </div>
    );
};
