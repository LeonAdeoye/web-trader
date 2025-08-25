import {useEffect, useMemo, useCallback, useState, useRef} from "react";
import {numberFormatter} from "../utilities";
import {ExchangeService} from "../services/ExchangeService";
import * as React from "react";
import EditIcon from "@mui/icons-material/Edit";
import CancelIcon from "@mui/icons-material/Cancel";
import SaveIcon from "@mui/icons-material/Save";
import {Tooltip} from "@mui/material";
import {LoggerService} from "../services/LoggerService";
import {AgGridReact} from "ag-grid-react";
import ErrorMessageComponent from "./ErrorMessageComponent";

const ADVLimitsGridComponent = () =>
{
    const [exchangeData, setExchangeData] = useState([]);
    const [editingRow, setEditingRow] = useState(null);
    const [originalData, setOriginalData] = useState({});
    const [errorMessage, setErrorMessage] = useState(null);
    const exchangeService = useMemo(() => new ExchangeService(), []);
    const loggerService = useRef(new LoggerService(ADVLimitsGridComponent.name)).current;

    useEffect(() =>
    {
        loadExchangeData().then(() => loggerService.logInfo("Exchange reference data loaded successfully"));
    }, []);

    const loadExchangeData = useCallback(async () =>
    {
        const url = "http://localhost:20017/limits/adv";
        try
        {
            await exchangeService.loadExchanges();
            const exchanges = exchangeService.getExchanges();

            const response = await fetch(url);
            let limitsData = [];

            if (response.ok)
                limitsData = await response.json(); // Array of ADV limits
            else
            {
                loggerService.logError(`Failed to fetch ADV % limits: ${response.statusText}`);
                setErrorMessage(`Failed to fetch ADV % limits from REST limits service: ${response.statusText}`);
            }

            const transformedData = exchanges.map((exchange) =>
            {
                const limit = limitsData.find(l => l.exchangeId === exchange.exchangeId);

                return {
                    exchangeId: exchange.exchangeId,
                    exchangeName: exchange.exchangeName,
                    buyADVLimit: limit?.buyADVLimit || 0,
                    sellADVLimit: limit?.sellADVLimit || 0
                };
            });
            
            setExchangeData(transformedData);
        }
        catch (error)
        {
            loggerService.logError("Failed to load exchange data: " + error);
            setErrorMessage(`Failed to load ADV% limits from REST limits service using URL: ${url}`);
        }
    }, [exchangeService, loggerService]);

    const handleEdit = useCallback((data) =>
    {
        setEditingRow(data.exchangeId);
        setOriginalData(prev => ({
            ...prev,
            [data.exchangeId]: {
                buyADVLimit: data.buyADVLimit,
                sellADVLimit: data.sellADVLimit
            }
        }));
    }, []);

    const handleCancel = useCallback((data) =>
    {
        setEditingRow(null);
        setExchangeData(prev => prev.map(exchange =>
            exchange.exchangeId === data.exchangeId
                ? {
                    ...exchange,
                    buyADVLimit: originalData[data.exchangeId]?.buyADVLimit || 0,
                    sellADVLimit: originalData[data.exchangeId]?.sellADVLimit || 0
                }
                : exchange));

        setOriginalData({});
    }, [originalData]);

    const handleSave = useCallback(async (data) =>
    {
        const url = "http://localhost:20017/limits/adv";
        setEditingRow(null);
        setOriginalData({});
        try
        {
            const response = await fetch(`${url}`, {
                method: 'POST',
                headers: {'Content-Type': 'application/json' },
                body: JSON.stringify({
                    exchangeId: data.exchangeId,
                    buyADVLimit: data.buyADVLimit,
                    sellADVLimit: data.sellADVLimit
                })
            });

            if (!response.ok)
            {
                loggerService.logError(`Failed to save ADV % limits: ${response.status}`);
                setErrorMessage(`Failed to save ADV % limits to REST limits service: ${response.statusText}`);
            }
        }
        catch (error)
        {
            loggerService.logError(`Error saving ADV% limits: ${error}`);
        }
    }, [loadExchangeData, loggerService]);

    const ADVLimitsActionRenderer = useCallback(({data}) =>
    {
        const isEditingThisRow = editingRow === data.exchangeId;
        const isAnyRowEditing = editingRow !== null;

        return (
            <div>
                {!isEditingThisRow ? (
                    <Tooltip title="Edit ADV% limits for this exchange">
                        <EditIcon 
                            style={{
                                cursor: isAnyRowEditing ? 'not-allowed' : 'pointer', 
                                marginRight: '5px', 
                                color: isAnyRowEditing ? '#ccc' : '#404040', 
                                height:'20px'
                            }}
                            onClick={isAnyRowEditing ? undefined : () => handleEdit(data)}
                        />
                    </Tooltip>
                ) : (
                    <>
                        <Tooltip title="Save changes to ADV% limits">
                            <SaveIcon 
                                onClick={() => handleSave(data)} 
                                style={{cursor: 'pointer', marginRight: '5px', color:'#404040', height:'20px'}}/>
                        </Tooltip>
                        <Tooltip title="Cancel changes to ADV% limits">
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
            headerName: 'Buy ADV % Limit',
            field: 'buyADVLimit', 
            valueFormatter: numberFormatter,
            editable: (params) => editingRow === params.data.exchangeId,
            cellEditor: 'agNumberCellEditor',
            cellEditorParams: {
                min: 0
            }
        },
        { 
            headerName: 'Sell ADV % Limit',
            field: 'sellADVLimit', 
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
            cellRenderer: ADVLimitsActionRenderer,
            width: 120
        }
    ]), [editingRow, ADVLimitsActionRenderer]);

    return (
        <>
            <div className="ag-theme-alpine notional-limits-grid" style={{ height: '100%', width: '100%' }}>
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

export default ADVLimitsGridComponent;
