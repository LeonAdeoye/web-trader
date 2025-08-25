import {useEffect, useMemo, useCallback, useState, useRef} from "react";
import {numberFormatter} from "../utilities";
import {ExchangeService} from "../services/ExchangeService";
import {LoggerService} from "../services/LoggerService";
import * as React from "react";
import EditIcon from "@mui/icons-material/Edit";
import CancelIcon from "@mui/icons-material/Cancel";
import SaveIcon from "@mui/icons-material/Save";
import {Tooltip} from "@mui/material";
import {AgGridReact} from "ag-grid-react";
import ErrorMessageComponent from "./ErrorMessageComponent";

const PriceLimitsGridComponent = () =>
{
    const [exchangeData, setExchangeData] = useState([]);
    const [editingRow, setEditingRow] = useState(null);
    const [originalData, setOriginalData] = useState({});
    const [errorMessage, setErrorMessage] = useState(null);
    const exchangeService = useMemo(() => new ExchangeService(), []);
    const loggerService = useRef(new LoggerService(PriceLimitsGridComponent.name)).current;

    useEffect(() =>
    {
        loadExchangeData().then(() => loggerService.logInfo("Exchange reference data loaded successfully"));
    }, []);

    const loadExchangeData = useCallback(async () =>
    {
        const url = "http://localhost:20017/limits/price";
        try
        {
            await exchangeService.loadExchanges();
            const exchanges = exchangeService.getExchanges();

            const response = await fetch(url);
            let limitsData = [];

            if (response.ok)
                limitsData = await response.json();
            else
            {
                loggerService.logError(`Failed to fetch price limits: ${response.statusText}`);
                setErrorMessage(`Failed to fetch price difference limits from REST limits service: ${response.statusText}`);
            }

            const transformedData = exchanges.map((exchange) =>
            {
                const limit = limitsData.find(l => l.exchangeId === exchange.exchangeId);

                return {
                    exchangeId: exchange.exchangeId,
                    exchangeName: exchange.exchangeName,
                    stockPriceDifferenceLimit: limit?.stockPriceDifferenceLimit || 0,
                    etfPriceDifferenceLimit: limit?.etfPriceDifferenceLimit || 0,
                    futurePriceDifferenceLimit: limit?.futurePriceDifferenceLimit || 0,
                    optionPriceDifferenceLimit: limit?.optionPriceDifferenceLimit || 0,
                    cryptoPriceDifferenceLimit: limit?.cryptoPriceDifferenceLimit || 0
                };
            });
            
            setExchangeData(transformedData);
        }
        catch (error)
        {
            loggerService.logError(`Failed to load exchange data: ${error}`);
            setErrorMessage(`Failed to load price difference limits from REST limits service using URL: ${url}`);
        }
    }, [exchangeService, loggerService]);

    const handleEdit = useCallback((data) =>
    {
        setEditingRow(data.exchangeId);
        setOriginalData(prev => ({
            ...prev,
            [data.exchangeId]: {
                stockPriceDifferenceLimit: data.stockPriceDifferenceLimit,
                etfPriceDifferenceLimit: data.etfPriceDifferenceLimit,
                futurePriceDifferenceLimit: data.futurePriceDifferenceLimit,
                optionPriceDifferenceLimit: data.optionPriceDifferenceLimit,
                cryptoPriceDifferenceLimit: data.cryptoPriceDifferenceLimit
            }
        }));
    }, []);

    const handleCancel = useCallback((data) =>
    {
        setExchangeData(prev => prev.map(exchange => 
            exchange.exchangeId === data.exchangeId 
                ? {
                    ...exchange,
                    stockPriceDifferenceLimit: originalData[data.exchangeId]?.stockPriceDifferenceLimit || 0,
                    etfPriceDifferenceLimit: originalData[data.exchangeId]?.etfPriceDifferenceLimit || 0,
                    futurePriceDifferenceLimit: originalData[data.exchangeId]?.futurePriceDifferenceLimit || 0,
                    optionPriceDifferenceLimit: originalData[data.exchangeId]?.optionPriceDifferenceLimit || 0,
                    cryptoPriceDifferenceLimit: originalData[data.exchangeId]?.cryptoPriceDifferenceLimit || 0
                }
                : exchange
        ));

        setEditingRow(null);
        setOriginalData({});
    }, [originalData]);

    const handleSave = useCallback(async (data) =>
    {
        const url = "http://localhost:20017/limits/price";
        setEditingRow(null);
        setOriginalData({});
        try
        {
            loggerService.logInfo(`Saving price limits for exchange ${data.exchangeId}`);
            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    exchangeId: data.exchangeId,
                    stockPriceDifferenceLimit: data.stockPriceDifferenceLimit,
                    etfPriceDifferenceLimit: data.etfPriceDifferenceLimit,
                    futurePriceDifferenceLimit: data.futurePriceDifferenceLimit,
                    optionPriceDifferenceLimit: data.optionPriceDifferenceLimit,
                    cryptoPriceDifferenceLimit: data.cryptoPriceDifferenceLimit
                })
            });

            if (!response.ok)
            {
                loggerService.logError(`Failed to save price limits: ${response.status}`);
                setErrorMessage(`Failed to save price difference limits to REST limits service: ${response.statusText}`);
            }
        }
        catch (error)
        {
            loggerService.logError(`Error saving price limits: ${error}`);
        }
    }, [loggerService]);

    const PriceLimitsActionRenderer = useCallback(({data}) =>
    {
        const isEditingThisRow = editingRow === data.exchangeId;
        const isAnyRowEditing = editingRow !== null;

        return (
            <div>
                {!isEditingThisRow ? (
                    <Tooltip title="Edit price difference limits for this exchange">
                        <EditIcon 
                            style={{
                                cursor: isAnyRowEditing ? 'not-allowed' : 'pointer', 
                                marginRight: '5px', 
                                color: isAnyRowEditing ? '#ccc' : '#404040', 
                                height:'20px'
                            }}
                            onClick={isAnyRowEditing ? undefined : () => handleEdit(data)}/>
                    </Tooltip>
                ) : (
                    <>
                        <Tooltip title="Save changes to price difference limits">
                            <SaveIcon 
                                onClick={() => handleSave(data)} 
                                style={{cursor: 'pointer', marginRight: '5px', color:'#404040', height:'20px'}}/>
                        </Tooltip>
                        <Tooltip title="Cancel changes to price difference limits">
                            <CancelIcon 
                                onClick={() => handleCancel(data)} 
                                style={{cursor: 'pointer', color:'#404040', height:'20px'}}/>
                        </Tooltip>
                    </>
                )}
            </div>
        );
    }, [editingRow, handleEdit, handleSave, handleCancel]);

    const columnDefs = useMemo(() =>
    ([
        { headerName: 'Exchange Id', field: 'exchangeId', hide: true, filter: true},
        { headerName: 'Exchange Name', field: 'exchangeName', filter: true, editable: false},
        { 
            headerName: 'Stock Price Difference % Limit',
            field: 'stockPriceDifferenceLimit', 
            valueFormatter: numberFormatter,
            editable: (params) => editingRow === params.data.exchangeId,
            cellEditor: 'agNumberCellEditor',
            cellEditorParams: {
                min: 0
            }
        },
        { 
            headerName: 'ETF Price Difference % Limit',
            field: 'etfPriceDifferenceLimit', 
            valueFormatter: numberFormatter,
            editable: (params) => editingRow === params.data.exchangeId,
            cellEditor: 'agNumberCellEditor',
            cellEditorParams: {
                min: 0
            }
        },
        { 
            headerName: 'Future Price Difference % Limit',
            field: 'futurePriceDifferenceLimit', 
            valueFormatter: numberFormatter,
            editable: (params) => editingRow === params.data.exchangeId,
            cellEditor: 'agNumberCellEditor',
            cellEditorParams: {
                min: 0
            }
        },
        { 
            headerName: 'Option Price Difference % Limit',
            field: 'optionPriceDifferenceLimit', 
            valueFormatter: numberFormatter,
            editable: (params) => editingRow === params.data.exchangeId,
            cellEditor: 'agNumberCellEditor',
            cellEditorParams: {
                min: 0
            }
        },
        { 
            headerName: 'Crypto Price Difference % Limit',
            field: 'cryptoPriceDifferenceLimit', 
            valueFormatter: numberFormatter,
            editable: (params) => editingRow === params.data.exchangeId,
            cellEditor: 'agNumberCellEditor',
            cellEditorParams: {
                min: 0
            }
        },
        { 
            headerName: 'Actions', 
            field: 'actions', 
            sortable: false, 
            filter: false,
            cellRenderer: PriceLimitsActionRenderer,
            width: 120
        }
    ]), [editingRow, PriceLimitsActionRenderer]);

    return (
        <>
            <div className="ag-theme-alpine price-limits-grid" style={{ height: '100%', width: '100%' }}>
                <AgGridReact
                    rowData={exchangeData}
                    columnDefs={columnDefs}
                    rowHeight={22}
                    headerHeight={22}
                    getRowId={params => params.data.exchangeId}/>
            </div>
            {errorMessage ? (<ErrorMessageComponent message={errorMessage} duration={3000} onDismiss={() => setErrorMessage(null)} position="bottom-right" maxWidth="900px"/>): null}
        </>
    );
}

export default PriceLimitsGridComponent;
