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

const QuantityLimitsGridComponent = () =>
{
    const [exchangeData, setExchangeData] = useState([]);
    const [editingRow, setEditingRow] = useState(null);
    const [originalData, setOriginalData] = useState({});
    const [errorMessage, setErrorMessage] = useState(null);
    const exchangeService = useMemo(() => new ExchangeService(), []);
    const loggerService = useRef(new LoggerService(QuantityLimitsGridComponent.name)).current;

    useEffect(() =>
    {
        loadExchangeData().then(() => loggerService.logInfo("Exchange reference data loaded successfully"));
    }, []);

    const loadExchangeData = useCallback(async () =>
    {
        const url = "http://localhost:20017/limits/qty";
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
                loggerService.logError(`Failed to fetch quantity limits: ${response.statusText}`);
                setErrorMessage(`Failed to fetch quantity limits from REST limits service: ${response.statusText}`);
            }

            const transformedData = exchanges.map((exchange) =>
            {
                const limit = limitsData.find(l => l.exchangeId === exchange.exchangeId);

                return {
                    exchangeId: exchange.exchangeId,
                    exchangeName: exchange.exchangeName,
                    stockQuantityLimit: limit?.stockQuantityLimit || 0,
                    etfQuantityLimit: limit?.etfQuantityLimit || 0,
                    futureQuantityLimit: limit?.futureQuantityLimit || 0,
                    optionQuantityLimit: limit?.optionQuantityLimit || 0,
                    cryptoQuantityLimit: limit?.cryptoQuantityLimit || 0
                };
            });
            
            setExchangeData(transformedData);
        }
        catch (error)
        {
            loggerService.logError(`Failed to load exchange data: ${error}`);
            setErrorMessage(`Failed to load quantity limits from REST limits service using URL: ${url}`);
        }
    }, [exchangeService, loggerService]);

    const handleEdit = useCallback((data) =>
    {
        setEditingRow(data.exchangeId);
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

        setEditingRow(null);
        setOriginalData({});
    }, [originalData]);

    const handleSave = useCallback(async (data) =>
    {
        const url = "http://localhost:20017/limits/qty";
        setEditingRow(null);
        setOriginalData({});
        try
        {
            loggerService.logInfo(`Saving quantity limits for exchange ${data.exchangeId}`);
            const response = await fetch(url, {
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

            if (!response.ok)
            {
                loggerService.logError(`Failed to save quantity limits: ${response.status}`);
                setErrorMessage(`Failed to save quantity limits to REST limits service: ${response.statusText}`);
            }
        }
        catch (error)
        {
            loggerService.logError(`Error saving quantity limits: ${error}`);
        }
    }, [loggerService]);

    const QuantityLimitsActionRenderer = useCallback(({data}) =>
    {
        const isEditingThisRow = editingRow === data.exchangeId;
        const isAnyRowEditing = editingRow !== null;

        return (
            <div>
                {!isEditingThisRow ? (
                    <Tooltip title="Edit quantity limits for this exchange">
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
                        <Tooltip title="Save changes to quantity limits">
                            <SaveIcon 
                                onClick={() => handleSave(data)} 
                                style={{cursor: 'pointer', marginRight: '5px', color:'#404040', height:'20px'}}/>
                        </Tooltip>
                        <Tooltip title="Cancel changes to quantity limits">
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
            headerName: 'Stock Quantity Limit', 
            field: 'stockQuantityLimit', 
            valueFormatter: numberFormatter,
            editable: (params) => editingRow === params.data.exchangeId,
            cellEditor: 'agNumberCellEditor',
            cellEditorParams: {
                min: 0
            }
        },
        { 
            headerName: 'ETF Quantity Limit', 
            field: 'etfQuantityLimit', 
            valueFormatter: numberFormatter,
            editable: (params) => editingRow === params.data.exchangeId,
            cellEditor: 'agNumberCellEditor',
            cellEditorParams: {
                min: 0
            }
        },
        { 
            headerName: 'Future Quantity Limit', 
            field: 'futureQuantityLimit', 
            valueFormatter: numberFormatter,
            editable: (params) => editingRow === params.data.exchangeId,
            cellEditor: 'agNumberCellEditor',
            cellEditorParams: {
                min: 0
            }
        },
        { 
            headerName: 'Option Quantity Limit', 
            field: 'optionQuantityLimit', 
            valueFormatter: numberFormatter,
            editable: (params) => editingRow === params.data.exchangeId,
            cellEditor: 'agNumberCellEditor',
            cellEditorParams: {
                min: 0
            }
        },
        { 
            headerName: 'Crypto Quantity Limit', 
            field: 'cryptoQuantityLimit', 
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
            cellRenderer: QuantityLimitsActionRenderer,
            width: 120
        }
    ]), [editingRow, QuantityLimitsActionRenderer]);

    return (
        <>
            <div className="ag-theme-alpine quantity-limits-grid" style={{ height: '100%', width: '100%' }}>
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

export default QuantityLimitsGridComponent;
