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

const QuantityLimitsGridComponent = () =>
{
    const [exchangeData, setExchangeData] = useState([]);
    const [editingRows, setEditingRows] = useState(new Set());
    const [originalData, setOriginalData] = useState({});
    const exchangeService = useMemo(() => new ExchangeService(), []);
    const loggerService = useRef(new LoggerService(QuantityLimitsGridComponent.name)).current;

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
                    loggerService.logInfo(`Loading quantity limits for exchange ${exchange.exchangeId}`);
                    const response = await fetch(`http://localhost:20017/qty/limits/${exchange.exchangeId}`);
                    let limitData = {
                        stockQuantityLimit: 0,
                        etfQuantityLimit: 0,
                        futureQuantityLimit: 0,
                        optionQuantityLimit: 0,
                        cryptoQuantityLimit: 0
                    };
                    
                    if (response.ok)
                    {
                        const limits = await response.json();
                        limitData = {
                            stockQuantityLimit: limits.stockQuantityLimit || 0,
                            etfQuantityLimit: limits.etfQuantityLimit || 0,
                            futureQuantityLimit: limits.futureQuantityLimit || 0,
                            optionQuantityLimit: limits.optionQuantityLimit || 0,
                            cryptoQuantityLimit: limits.cryptoQuantityLimit || 0
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
                    loggerService.logError(`Failed to load quantity limits for exchange ${exchange.exchangeId}: ${limitError}`);
                    return {
                        exchangeId: exchange.exchangeId,
                        exchangeName: exchange.exchangeName,
                        stockQuantityLimit: 0,
                        etfQuantityLimit: 0,
                        futureQuantityLimit: 0,
                        optionQuantityLimit: 0,
                        cryptoQuantityLimit: 0
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
                stockQuantityLimit: data.stockQuantityLimit,
                etfQuantityLimit: data.etfQuantityLimit,
                futureQuantityLimit: data.futureQuantityLimit,
                optionQuantityLimit: data.optionQuantityLimit,
                cryptoQuantityLimit: data.cryptoQuantityLimit
            }
        }));
    }, []);

    const handleCancel = useCallback((data) =>
    {
        setEditingRows(prev =>
        {
            const newSet = new Set(prev);
            newSet.delete(data.exchangeId);
            return newSet;
        });

        setExchangeData(prev => prev.map(exchange => 
            exchange.exchangeId === data.exchangeId 
                ? {
                    ...exchange,
                    stockQuantityLimit: originalData[data.exchangeId]?.stockQuantityLimit || 0,
                    etfQuantityLimit: originalData[data.exchangeId]?.etfQuantityLimit || 0,
                    futureQuantityLimit: originalData[data.exchangeId]?.futureQuantityLimit || 0,
                    optionQuantityLimit: originalData[data.exchangeId]?.optionQuantityLimit || 0,
                    cryptoQuantityLimit: originalData[data.exchangeId]?.cryptoQuantityLimit || 0
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
            loggerService.logInfo(`Saving quantity limits for exchange ${data.exchangeId}`);
            const response = await fetch(`http://localhost:20017/qty/limits/`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    exchangeId: data.exchangeId,
                    stockQuantityLimit: data.stockQuantityLimit,
                    etfQuantityLimit: data.etfQuantityLimit,
                    futureQuantityLimit: data.futureQuantityLimit,
                    optionQuantityLimit: data.optionQuantityLimit,
                    cryptoQuantityLimit: data.cryptoQuantityLimit
                })
            });

            if (response.ok)
            {
                setEditingRows(prev =>
                {
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
            {
                loggerService.logError(`Failed to save quantity limits: ${response.status}`);
            }
        }
        catch (error)
        {
            loggerService.logError(`Error saving quantity limits: ${error}`);
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

    const QuantityLimitsActionRenderer = useCallback(({data}) =>
    {
        const isEditing = editingRows.has(data.exchangeId);

        return (
            <div>
                {!isEditing ? (
                    <Tooltip title="Edit quantity limits">
                        <EditIcon 
                            onClick={() => handleEdit(data)} 
                            style={{cursor: 'pointer', marginRight: '5px', color:'#404040', height:'20px'}}/>
                    </Tooltip>
                ) : (
                    <>
                        <Tooltip title="Save changes the recently updated quantity limits">
                            <SaveIcon 
                                onClick={() => handleSave(data)} 
                                style={{cursor: 'pointer', marginRight: '5px', color:'#404040', height:'20px'}}/>
                        </Tooltip>
                        <Tooltip title="Cancel changes the recently updated quantity limits">
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
            headerName: 'Stock Quantity Limit', 
            field: 'stockQuantityLimit', 
            valueFormatter: numberFormatter,
            editable: (params) => editingRows.has(params.data.exchangeId),
            cellEditor: 'agNumberCellEditor',
            cellEditorParams: {
                min: 0
            }
        },
        { 
            headerName: 'ETF Quantity Limit', 
            field: 'etfQuantityLimit', 
            valueFormatter: numberFormatter,
            editable: (params) => editingRows.has(params.data.exchangeId),
            cellEditor: 'agNumberCellEditor',
            cellEditorParams: {
                min: 0
            }
        },
        { 
            headerName: 'Future Quantity Limit', 
            field: 'futureQuantityLimit', 
            valueFormatter: numberFormatter,
            editable: (params) => editingRows.has(params.data.exchangeId),
            cellEditor: 'agNumberCellEditor',
            cellEditorParams: {
                min: 0
            }
        },
        { 
            headerName: 'Option Quantity Limit', 
            field: 'optionQuantityLimit', 
            valueFormatter: numberFormatter,
            editable: (params) => editingRows.has(params.data.exchangeId),
            cellEditor: 'agNumberCellEditor',
            cellEditorParams: {
                min: 0
            }
        },
        { 
            headerName: 'Crypto Quantity Limit', 
            field: 'cryptoQuantityLimit', 
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
            cellRenderer: QuantityLimitsActionRenderer,
            width: 120
        }
    ]), [editingRows, QuantityLimitsActionRenderer]);

    return (
        <div className="quantity-limits-grid">
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

export default QuantityLimitsGridComponent;
