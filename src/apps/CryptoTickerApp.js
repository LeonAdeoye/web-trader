import * as React from 'react';
import {useEffect, useMemo, useState, useRef, useCallback} from "react";
import {AgGridReact} from "ag-grid-react";
import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-alpine.css';
import {FDC3Service} from "../services/FDC3Service";
import {currencyFormatter, numberFormatter} from "../utilities";
import {ServiceRegistry} from "../services/ServiceRegistry";
import {LoggerService} from "../services/LoggerService";

export const CryptoTickerApp = () =>
{
    const [prices, setPrices] = useState([]);
    const [subscribedInstruments, setSubscribedInstruments] = useState(new Set());
    const [errorMessage, setErrorMessage] = useState(null);
    const [worker, setWorker] = useState(null);
    const gridApiRef = useRef();
    const configurationService = useRef(ServiceRegistry.getConfigurationService()).current;
    const marketDataService = useRef(ServiceRegistry.getMarketDataService()).current;
    const loggerService = useRef(new LoggerService(CryptoTickerApp.name)).current;
    const gridDimensions = useMemo(() => ({ height: '100%', width: '100%' }), []);
    const defaultColDef = useMemo(() => ({resizable: true, filter: true, sortable: true}), []);
    const getRowId = useMemo(() => (row) => row.data.symbol, []);
    const windowId = useMemo(() => window.command.getWindowId("Crypto Ticker"), []);

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
        const loadCryptoInstruments = async () =>
        {
            try
            {
                const instruments = await configurationService.getCryptoInstruments();
                loggerService.logInfo(`Loaded crypto instruments: ${JSON.stringify(instruments)}`);
                
                if (instruments && instruments.length > 0)
                {
                    await marketDataService.subscribeToCrypto(instruments);
                    setSubscribedInstruments(new Set(instruments));
                    loggerService.logInfo(`Successfully subscribed to ${instruments.length} crypto instruments`);
                }
            }
            catch (error)
            {
                loggerService.logError(`Failed to load and subscribe to crypto instruments: ${error.message}`);
                setErrorMessage(`Failed to load crypto instruments: ${error.message}`);
            }
        };

        loadCryptoInstruments();
    }, [configurationService, marketDataService, loggerService]);

    useEffect(() =>
    {
        const webWorker = new Worker(new URL("../workers/crypto-price-reader.js", import.meta.url));
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
        const { messageType, cryptoPrice: eventPrice } = event.data;
        setPrices(prevPrices =>
        {
            if (messageType === "update" && prevPrices.findIndex((price) => price.symbol === eventPrice.symbol) !== -1)
            {
                updateRows(eventPrice);
                return prevPrices;
            }
            return [...prevPrices, eventPrice];
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

    useEffect(() =>
    {
        return () =>
        {
            if (subscribedInstruments.size > 0)
                marketDataService.unsubscribeAllCrypto([...subscribedInstruments]).catch(error => loggerService.logError(`Failed to unsubscribe on cleanup: ${error.message}`));
        };
    }, [subscribedInstruments, marketDataService, loggerService]);

    return (
        <div>
            {errorMessage && (
                <div style={{ 
                    color: 'red', 
                    padding: '10px', 
                    backgroundColor: '#ffebee',
                    margin: '10px',
                    borderRadius: '4px'
                }}>
                    {errorMessage}
                </div>
            )}
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
        </div>
    );
};
