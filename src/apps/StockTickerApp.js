import { AgGridReact } from 'ag-grid-react';
import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-alpine.css';
import React, { useEffect, useState, useRef, useCallback, useMemo } from "react";
import TitleBarComponent from "../components/TitleBarComponent";
import { ServiceRegistry } from '../services/ServiceRegistry';
import MarketDataActionsRenderer from '../components/MarketDataActionsRenderer';
import { LoggerService } from '../services/LoggerService';

export const StockTickerApp = () =>
{
    const [instruments, setInstruments] = useState([]);
    const [, setMarketData] = useState(new Map());
    const [subscribedRics, setSubscribedRics] = useState(new Set());
    const [errorMessage, setErrorMessage] = useState(null);
    const instrumentService = useRef(ServiceRegistry.getInstrumentService()).current;
    const marketDataService = useRef(ServiceRegistry.getMarketDataService()).current;
    const loggerService = useRef(new LoggerService(StockTickerApp.name)).current;
    const windowId = useMemo(() => window.command.getWindowId("Stock Ticker"), []);
    const [inboundWorker, setInboundWorker] = useState(null);

    const gridApiRef = useRef();

    const columnDefs = useMemo(() =>
    ([
        { headerName: 'RIC', field: 'ric', sortable: true, minWidth: 120, width: 120, filter: true },
        { headerName: 'Price', field: 'price', sortable: true, minWidth: 100, width: 100, filter: true, 
          valueFormatter: (params) => params.value ? params.value.toFixed(2) : '--' },
        { headerName: 'Status', field: 'isSubscribed', sortable: true, minWidth: 100, width: 100, filter: true,
          valueGetter: (params) => params.data?.isSubscribed ? 'Subscribed' : 'Not Subscribed' },
        { headerName: 'Actions', field: 'actions', sortable: false, minWidth: 120, width: 120, filter: false,
          cellRenderer: MarketDataActionsRenderer }
    ]), [instruments, subscribedRics]);

    useEffect(() =>
    {
        const loadInstruments = async () =>
        {
            try
            {
                await instrumentService.loadInstruments();
                const instrumentsData = instrumentService.getInstruments();
                const initialData = instrumentsData.map(instrument => ({ ric: instrument.instrumentCode, price: null, isSubscribed: false }));
                setInstruments(initialData);
            }
            catch (error)
            {
                loggerService.logError(`Failed to load instruments: ${error.message}`);
                setErrorMessage('Failed to load instruments');
            }
        };

        loadInstruments().then(() => loggerService.logInfo("Instruments loaded successfully."));
    }, [instrumentService]);

    useEffect(() =>
    {
        const webWorker = new Worker(new URL("../workers/market-data-reader.js", import.meta.url));
        setInboundWorker(webWorker);
        return () => webWorker.terminate();
    }, []);

    const handleWorkerMessage = useCallback((event) =>
    {
        const { ric, price } = event.data.marketData;
        setMarketData(prev =>
        {
            const newMap = new Map(prev);
            newMap.set(ric, price);
            return newMap;
        });
    } , []);

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

    const handleSubscribe = useCallback(async (ric) =>
    {
        try
        {
            setErrorMessage(null);
            await marketDataService.subscribe([ric]);
            setSubscribedRics(prev => new Set([...prev, ric]));
            setInstruments(prev => prev.map(instrument => instrument.ric === ric ? { ...instrument, isSubscribed: true } : instrument ));
        }
        catch (error)
        {
            loggerService.logError(`Failed to subscribe to ${ric}: ${error.message}`);
            setErrorMessage(`Failed to subscribe to ${ric}: ${error.message}`);
        }
    }, [marketDataService]);

    const handleUnsubscribe = useCallback(async (ric) =>
    {
        try
        {
            setErrorMessage(null);
            await marketDataService.unsubscribe(ric);
            setSubscribedRics(prev =>
            {
                const newSet = new Set(prev);
                newSet.delete(ric);
                return newSet;
            });
            setInstruments(prev => prev.map(instrument => instrument.ric === ric ? { ...instrument, isSubscribed: false } : instrument));
        }
        catch (error)
        {
            loggerService.logError(`Failed to unsubscribe from ${ric}: ${error.message}`);
            setErrorMessage(`Failed to unsubscribe from ${ric}: ${error.message}`);
        }
    }, [marketDataService]);

    useEffect(() =>
    {
        return () =>
        {
            if (subscribedRics.size > 0)
                marketDataService.unsubscribeAll([...subscribedRics]).catch(error => loggerService.logError(`Failed to unsubscribe on cleanup: ${error.message}`));
        };
    }, [subscribedRics]);

    const gridContext = useMemo(() =>
    ({
        onSubscribe: handleSubscribe,
        onUnsubscribe: handleUnsubscribe
    }), [handleSubscribe, handleUnsubscribe]);

    return (
        <div>
            <TitleBarComponent 
                title="Stock Ticker" 
                windowId={windowId} 
                addButtonProps={undefined} 
                showChannel={true} 
                showTools={false}/>
            
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
            
            <div className="ag-theme-alpine" style={{ 
                width: '100%', 
                height: 'calc(100vh - 65px)', 
                float: 'left', 
                padding: '0px', 
                margin: '45px 0px 0px 0px'
            }}>
                <AgGridReact
                    columnDefs={columnDefs}
                    ref={gridApiRef}
                    rowSelection={'single'}
                    rowHeight={25}
                    rowData={instruments}
                    getRowId={({ data: { ric } }) => ric}
                    onGridSizeChanged={({ api }) => api.sizeColumnsToFit()}
                    context={gridContext}
                    defaultColDef={{ resizable: true, sortable: true, filter: true, floatingFilter: false }}/>
            </div>
        </div>
    );
};

