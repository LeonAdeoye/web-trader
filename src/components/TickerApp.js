import * as React from 'react';
import {useEffect, useMemo, useState, useRef} from "react";
import { AgGridReact} from "ag-grid-react";
import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-alpine.css';

export const TickerApp = () =>
{
    const [prices, setPrices]  = useState([]);
    const [worker, setWorker] = useState(null);
    const gridApi = useRef();

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
        {headerName: "Symbol", field: "symbol"},
        {headerName: "Best Ask", field: "best_ask", cellDataType: "number", valueFormatter: currencyFormatter},
        {headerName: "Best Bid", field: "best_bid", cellDataType: "number", valueFormatter: currencyFormatter},
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
        if (worker)
        {
            worker.onmessage = (event) =>
            {
                const { messageType, price: eventPrice } = event.data;

                setPrices((prevPrices) =>
                {
                    if (messageType === "update")
                    {
                        const index = prevPrices.findIndex((price) => price.symbol === eventPrice.symbol);
                        if (index !== -1)
                            return prevPrices.map((price, i) =>  i === index ? { ...price, ...eventPrice } : price);
                        else
                            return [...prevPrices, eventPrice];
                    }

                    if (messageType === "snapshot")
                        return [...prevPrices, eventPrice];

                    return prevPrices;
                });
            };
        }
    }, [worker]);

    return (
        <div className="ag-theme-alpine" style={{height: '100%', width: '100%'}}>
            <AgGridReact
                columnDefs={columnDefs}
                rowData={prices}
                defaultColDef={defaultColDef}
            />
        </div>
    );
};
