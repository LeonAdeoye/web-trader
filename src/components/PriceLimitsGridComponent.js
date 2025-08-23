import {useEffect, useMemo, useCallback, useState, useRef} from "react";
import {numberFormatter} from "../utilities";
import {GenericGridComponent} from "./GenericGridComponent";
import {ExchangeService} from "../services/ExchangeService";
import {LoggerService} from "../services/LoggerService";
import * as React from "react";
import EditIcon from "@mui/icons-material/Edit";
import CancelIcon from "@mui/icons-material/Cancel";
import SaveIcon from "@mui/icons-material/Save";
import {Tooltip} from "@mui/material";

const PriceLimitsGridComponent = () =>
{
    const [exchangeData, setExchangeData] = useState([]);
    const [editingRows, setEditingRows] = useState(new Set());
    const [originalData, setOriginalData] = useState({});
    const exchangeService = useMemo(() => new ExchangeService(), []);
    const loggerService = useRef(new LoggerService(PriceLimitsGridComponent.name)).current;

    useEffect(() =>
    {
        loadExchangeData();
    }, []);

    const loadExchangeData = useCallback(async () =>
    {
        try
        {
            await exchangeService.loadExchanges();
            const exchanges = exchangeService.getExchanges();

            const transformedData = await Promise.all(exchanges.map(async (exchange) =>
            {
                try
                {
                    loggerService.logInfo(`Loading price limits for exchange ${exchange.exchangeId}`);
                    const response = await fetch(`http://localhost:20017/price/limits/${exchange.exchangeId}`);
                    let limitData = {
                        stockPriceDifferenceLimit: 0,
                        etfPriceDifferenceLimit: 0,
                        futurePriceDifferenceLimit: 0,
                        optionPriceDifferenceLimit: 0,
                        cryptoPriceDifferenceLimit: 0
                    };
                    
                    if (response.ok)
                    {
                        const limits = await response.json();
                        limitData = {
                            stockPriceDifferenceLimit: limits.stockPriceDifferenceLimit || 0,
                            etfPriceDifferenceLimit: limits.etfPriceDifferenceLimit || 0,
                            futurePriceDifferenceLimit: limits.futurePriceDifferenceLimit || 0,
                            optionPriceDifferenceLimit: limits.optionPriceDifferenceLimit || 0,
                            cryptoPriceDifferenceLimit: limits.cryptoPriceDifferenceLimit || 0
                        };
                    }
                    
                    return {
                        exchangeId: exchange.exchangeId,
                        exchangeName: exchange.exchangeName,
                        ...limitData
                    };
                }
                catch (limitError)
                {
                    loggerService.logError(`Failed to load price limits for exchange ${exchange.exchangeId}: ${limitError}`);
                    return {
                        exchangeId: exchange.exchangeId,
                        exchangeName: exchange.exchangeName,
                        stockPriceDifferenceLimit: 0,
                        etfPriceDifferenceLimit: 0,
                        futurePriceDifferenceLimit: 0,
                        optionPriceDifferenceLimit: 0,
                        cryptoPriceDifferenceLimit: 0
                    };
                }
            }));
            
            setExchangeData(transformedData);
        }
        catch (error)
        {
            loggerService.logError(`Failed to load exchange data: ${error}`);
        }
    }, [exchangeService]);

    const handleEdit = useCallback((data) =>
    {
        setEditingRows(prev => new Set(prev).add(data.exchangeId));
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
        setEditingRows(prev => {
            const newSet = new Set(prev);
            newSet.delete(data.exchangeId);
            return newSet;
        });

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

        setOriginalData(prev =>
        {
            const newData = { ...prev };
            delete newData[data.exchangeId];
            return newData;
        });
    }, [originalData]);

    const handleSave = useCallback(async (data) =>
    {
        try
        {
            loggerService.logInfo(`Saving price limits for exchange ${data.exchangeId}`);
            const response = await fetch(`http://localhost:20017/price/limits/`, {
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

            if (response.ok)
            {
                setEditingRows(prev => {
                    const newSet = new Set(prev);
                    newSet.delete(data.exchangeId);
                    return newSet;
                });

                setOriginalData(prev =>
                {
                    const newData = { ...prev };
                    delete newData[data.exchangeId];
                    return newData;
                });

                await loadExchangeData();
            }
            else
                loggerService.logError(`Failed to save price limits: ${response.status}`);
        }
        catch (error)
        {
            loggerService.logError(`Error saving price limits: ${error}`);
        }
    }, [loadExchangeData]);

    const handleCellValueChanged = useCallback((params) =>
    {
        if (editingRows.has(params.data.exchangeId))
        {
            setExchangeData(prev => prev.map(exchange => 
                exchange.exchangeId === params.data.exchangeId 
                    ? { ...exchange, [params.colDef.field]: params.newValue }
                    : exchange
            ));
        }
    }, [editingRows]);

    const PriceLimitsActionRenderer = useCallback(({data}) =>
    {
        const isEditing = editingRows.has(data.exchangeId);

        return (
            <div>
                {!isEditing ? (
                    <Tooltip title="Edit price difference limits.">
                        <EditIcon 
                            onClick={() => handleEdit(data)} 
                            style={{cursor: 'pointer', marginRight: '5px', color:'#404040', height:'20px'}}/>
                    </Tooltip>
                ) : (
                    <>
                        <Tooltip title="Save changes to the recently updated price difference limits.">
                            <SaveIcon 
                                onClick={() => handleSave(data)} 
                                style={{cursor: 'pointer', marginRight: '5px', color:'#404040', height:'20px'}}/>
                        </Tooltip>
                        <Tooltip title="Cancel changes to the recently updated price difference limits.">
                            <CancelIcon 
                                onClick={() => handleCancel(data)} 
                                style={{cursor: 'pointer', color:'#404040', height:'20px'}}/>
                        </Tooltip>
                    </>
                )}
            </div>
        );
    }, [editingRows, handleEdit, handleSave, handleCancel]);

    const columnDefs = useMemo(() =>
    ([
        { headerName: 'Exchange Id', field: 'exchangeId', hide: true, filter: true},
        { headerName: 'Exchange Name', field: 'exchangeName', filter: true, editable: false},
        { 
            headerName: 'Stock Price Difference Limit', 
            field: 'stockPriceDifferenceLimit', 
            valueFormatter: numberFormatter,
            editable: (params) => editingRows.has(params.data.exchangeId),
            cellEditor: 'agNumberCellEditor',
            cellEditorParams: {
                min: 0
            }
        },
        { 
            headerName: 'ETF Price Difference Limit', 
            field: 'etfPriceDifferenceLimit', 
            valueFormatter: numberFormatter,
            editable: (params) => editingRows.has(params.data.exchangeId),
            cellEditor: 'agNumberCellEditor',
            cellEditorParams: {
                min: 0
            }
        },
        { 
            headerName: 'Future Price Difference Limit', 
            field: 'futurePriceDifferenceLimit', 
            valueFormatter: numberFormatter,
            editable: (params) => editingRows.has(params.data.exchangeId),
            cellEditor: 'agNumberCellEditor',
            cellEditorParams: {
                min: 0
            }
        },
        { 
            headerName: 'Option Price Difference Limit', 
            field: 'optionPriceDifferenceLimit', 
            valueFormatter: numberFormatter,
            editable: (params) => editingRows.has(params.data.exchangeId),
            cellEditor: 'agNumberCellEditor',
            cellEditorParams: {
                min: 0
            }
        },
        { 
            headerName: 'Crypto Price Difference Limit', 
            field: 'cryptoPriceDifferenceLimit', 
            valueFormatter: numberFormatter,
            editable: (params) => editingRows.has(params.data.exchangeId),
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
    ]), [editingRows, PriceLimitsActionRenderer]);

    return (
        <div className="price-limits-grid">
            <GenericGridComponent 
                rowHeight={22} 
                gridTheme={"ag-theme-alpine"} 
                rowIdArray={["exchangeId"]} 
                columnDefs={columnDefs} 
                gridData={exchangeData} 
                handleAction={null}
                onCellValueChanged={handleCellValueChanged}/>
        </div>
    );
}

export default PriceLimitsGridComponent;
