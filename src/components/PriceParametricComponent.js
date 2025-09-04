import {useEffect, useMemo, useCallback, useState, useRef} from "react";
import {AgGridReact} from "ag-grid-react";
import {PriceService} from "../services/PriceService";
import {InstrumentService} from "../services/InstrumentService";
import {LoggerService} from "../services/LoggerService";
import {formatDate, numberFormatter} from "../utilities";

export const PriceParametricComponent = () =>
{
    const [prices, setPrices] = useState([]);
    const [instruments, setInstruments] = useState([]);
    const [ownerId, setOwnerId] = useState('');
    const priceService = useRef(new PriceService()).current;
    const instrumentService = useRef(new InstrumentService()).current;
    const loggerService = useRef(new LoggerService(PriceParametricComponent.name)).current;

    useEffect(() =>
    {
        const loadOwner = async () =>  setOwnerId(await window.configurations.getLoggedInUserId());

        loadOwner();

    }, []);

    useEffect(() =>
    {
        const loadData = async () =>
        {
            try
            {
                await instrumentService.loadInstruments();
                const loadedInstruments = instrumentService.getInstruments();
                setInstruments(loadedInstruments);
                loggerService.logInfo(`Loaded ${loadedInstruments.length} instruments`);
                
                await priceService.loadPrices();
                let loadedPrices = priceService.getPrices();
                loggerService.logInfo(`Loaded ${loadedPrices.length} prices from service`);
                
                // If no prices loaded (either empty response or HTTP failure), create dummy data
                if (loadedPrices.length === 0 && loadedInstruments.length > 0)
                {
                    loggerService.logInfo(`Creating dummy prices for ${loadedInstruments.length} instruments`);
                    loadedPrices = priceService.createDefaultPrices(loadedInstruments, 100.0, 99.0);
                }
                
                setPrices(loadedPrices);
                loggerService.logInfo(`Setting ${loadedPrices.length} prices in component state`);
            }
            catch (error)
            {
                loggerService.logError(`Error loading data: ${error.message}`);
                // Even if there's an error, try to create dummy data if we have instruments
                const loadedInstruments = instrumentService.getInstruments();
                loggerService.logInfo(`Error case: Found ${loadedInstruments.length} instruments`);
                if (loadedInstruments.length > 0)
                {
                    loggerService.logInfo(`Creating dummy prices in error case for ${loadedInstruments.length} instruments`);
                    const dummyPrices = priceService.createDefaultPrices(loadedInstruments, 100.0, 99.0);
                    setPrices(dummyPrices);
                    loggerService.logInfo(`Set ${dummyPrices.length} dummy prices in error case`);
                }
            }
        };
        
        loadData();
    }, [priceService, instrumentService, loggerService]);

    const onCellValueChanged = useCallback(async (params) =>
    {
        if (params.colDef.field === 'closePrice' || params.colDef.field === 'openPrice')
        {
            try
            {
                const { data } = params;
                const newPrice = parseFloat(params.newValue);
                
                if (isNaN(newPrice) || newPrice < 0)
                {
                    params.node.setDataValue(params.colDef.field, params.oldValue);
                    return;
                }

                const updatedPrice = await priceService.updatePrice(
                    data.instrumentCode, 
                    data.closePrice, 
                    data.openPrice, 
                    ownerId
                );

                setPrices(prev => prev.map(p => p.instrumentCode === data.instrumentCode ? updatedPrice : p));
                
                loggerService.logInfo(`Successfully updated price for ${data.instrumentCode}: Close=${data.closePrice}, Open=${data.openPrice}`);
                
            }
            catch (error)
            {
                loggerService.logError(`Error updating price: ${error.message}`);
                params.node.setDataValue(params.colDef.field, params.oldValue);
            }
        }
    }, [priceService, loggerService, ownerId]);

    const columnDefs = useMemo(() =>
    [
        {
            headerName: "Instrument",
            field: "instrumentCode",
            sortable: true,
            filter: true,
            minWidth: 150,
            width: 150,
            editable: false,
            cellRenderer: (params) => {
                const instrument = instruments.find(i => i.instrumentCode === params.value);
                return instrument?.instrumentName || params.value;
            }
        },
        {
            headerName: "Close Price",
            field: "closePrice",
            sortable: true,
            filter: true,
            minWidth: 120,
            width: 120,
            editable: true,
            type: 'numericColumn',
            valueFormatter: (params) => numberFormatter(params.value, 2),
            cellStyle: { backgroundColor: '#f0f8ff' }
        },
        {
            headerName: "Open Price",
            field: "openPrice",
            sortable: true,
            filter: true,
            minWidth: 120,
            width: 120,
            editable: true,
            type: 'numericColumn',
            valueFormatter: (params) => numberFormatter(params.value, 2),
            cellStyle: { backgroundColor: '#f0f8ff' }
        },
        {
            headerName: "Last Updated By",
            field: "lastUpdatedBy",
            sortable: true,
            filter: true,
            minWidth: 150,
            width: 150,
            editable: false
        },
        {
            headerName: "Last Updated On",
            field: "lastUpdatedOn",
            sortable: true,
            filter: true,
            minWidth: 150,
            width: 150,
            editable: false,
            valueFormatter: (params) => formatDate(params.value)
        }
    ], [instruments]);

    const defaultColDef = useMemo(() =>
    ({
        resizable: true,
        filter: true,
        sortable: true
    }), []);

    const onGridReady = useCallback((params) =>
    {
        params.columnApi.applyColumnState({
            state: [{ colId: 'instrumentCode', sort: 'asc' }],
            applyOrder: true,
        });
    }, []);

    return (
        <div className="ag-theme-alpine price-parametric" style={{ height: '100%', width: '100%' }}>
            <AgGridReact
                columnDefs={columnDefs}
                rowData={prices}
                defaultColDef={defaultColDef}
                onGridReady={onGridReady}
                onCellValueChanged={onCellValueChanged}
                rowHeight={22}
                headerHeight={22}
                getRowId={(params) => params.data.instrumentCode}
                enableCellChangeFlash={true}
                animateRows={true}
                suppressRowClickSelection={true}/>
        </div>
    );
};
