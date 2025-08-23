import {useEffect, useMemo, useCallback, useState, useRef} from "react";
import {numberFormatter} from "../utilities";
import {GenericGridComponent} from "./GenericGridComponent";
import {ExchangeService} from "../services/ExchangeService";
import * as React from "react";
import EditIcon from "@mui/icons-material/Edit";
import CancelIcon from "@mui/icons-material/Cancel";
import SaveIcon from "@mui/icons-material/Save";
import {Tooltip} from "@mui/material";
import {LoggerService} from "../services/LoggerService";

const ADVLimitsGridComponent = () =>
{
    const [exchangeData, setExchangeData] = useState([]);
    const [editingRows, setEditingRows] = useState(new Set());
    const [originalData, setOriginalData] = useState({});
    const exchangeService = useMemo(() => new ExchangeService(), []);
    const loggerService = useRef(new LoggerService(ADVLimitsGridComponent.name)).current;

    useEffect(() =>
    {
        loadExchangeData().then(() => loggerService.logInfo("Exchange reference data loaded successfully"));
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
                    const response = await fetch(`http://localhost:20017/adv/limits/${exchange.exchangeId}`);
                    let limitData = {
                        buyADVLimit: 0,
                        sellADVLimit: 0
                    };
                    
                    if (response.ok)
                    {
                        const limits = await response.json();
                        limitData = {
                            buyADVLimit: limits.buyADVLimit || 0,
                            sellADVLimit: limits.sellADVLimit || 0
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
                    loggerService.logError(`Failed to load ADV limits for exchange ${exchange.exchangeId}: ${limitError}`);
                    return {
                        exchangeId: exchange.exchangeId,
                        exchangeName: exchange.exchangeName,
                        buyADVLimit: 0,
                        sellADVLimit: 0
                    };
                }
            }));
            
            setExchangeData(transformedData);
        }
        catch (error)
        {
            loggerService.logError("Failed to load exchange data: " + error);
        }
    }, [exchangeService, loggerService]);

    const handleEdit = useCallback((data) =>
    {
        setEditingRows(prev => new Set(prev).add(data.exchangeId));
        setOriginalData(prev =>
        ({
            ...prev,
            [data.exchangeId]: {
                buyADVLimit: data.buyADVLimit,
                sellADVLimit: data.sellADVLimit
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
        
        // Revert to original values
        setExchangeData(prev => prev.map(exchange => 
            exchange.exchangeId === data.exchangeId 
                ? {
                    ...exchange,
                    buyADVLimit: originalData[data.exchangeId]?.buyADVLimit || 0,
                    sellADVLimit: originalData[data.exchangeId]?.sellADVLimit || 0
                }
                : exchange
        ));
        
        // Clean up original data
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
            const response = await fetch(`http://localhost:20017/adv/limits/`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    exchangeId: data.exchangeId,
                    buyADVLimit: data.buyADVLimit,
                    sellADVLimit: data.sellADVLimit
                })
            });

            if (response.ok)
            {
                // Exit edit mode
                setEditingRows(prev =>
                {
                    const newSet = new Set(prev);
                    newSet.delete(data.exchangeId);
                    return newSet;
                });
                
                // Clean up original data
                setOriginalData(prev =>
                {
                    const newData = { ...prev };
                    delete newData[data.exchangeId];
                    return newData;
                });
                await loadExchangeData();
            }
            else
                loggerService.logError(`Failed to save ADV% limits: ${response.status}`);
        }
        catch (error)
        {
            loggerService.logError(`Error saving ADV% limits: ${error}`);
        }
    }, [loadExchangeData, loggerService]);

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

    const ADVLimitsActionRenderer = useCallback(({data}) =>
    {
        const isEditing = editingRows.has(data.exchangeId);

        return (
            <div>
                {!isEditing ? (
                    <Tooltip title="Edit all the ADV% limits">
                        <EditIcon 
                            onClick={() => handleEdit(data)} 
                            style={{cursor: 'pointer', marginRight: '5px', color:'#404040', height:'20px'}}/>
                    </Tooltip>
                ) : (
                    <>
                        <Tooltip title="Save changes to all of the updated the ADV% limits">
                            <SaveIcon 
                                onClick={() => handleSave(data)} 
                                style={{cursor: 'pointer', marginRight: '5px', color:'#404040', height:'20px'}}/>
                        </Tooltip>
                        <Tooltip title="Cancel ALL current changes to all of the ADV% limits">
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
            headerName: 'Buy ADV% Limit',
            field: 'buyADVLimit', 
            valueFormatter: numberFormatter,
            editable: (params) => editingRows.has(params.data.exchangeId),
            cellEditor: 'agNumberCellEditor',
            cellEditorParams: {
                min: 0
            }
        },
        { 
            headerName: 'Sell ADV% Limit',
            field: 'sellADVLimit', 
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
            cellRenderer: ADVLimitsActionRenderer,
            width: 120
        }
    ]), [editingRows, ADVLimitsActionRenderer]);

    return (
        <div className="adv-limits-grid">
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

export default ADVLimitsGridComponent;
