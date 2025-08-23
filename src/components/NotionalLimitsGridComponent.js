import {useEffect, useMemo, useCallback, useState, useRef} from "react";
import {numberFormatter} from "../utilities";
import {GenericGridComponent} from "./GenericGridComponent";
import {DeskService} from "../services/DeskService";
import {LoggerService} from "../services/LoggerService";
import * as React from "react";
import EditIcon from "@mui/icons-material/Edit";
import CancelIcon from "@mui/icons-material/Cancel";
import SaveIcon from "@mui/icons-material/Save";
import {Tooltip} from "@mui/material";

const NotionalLimitsGridComponent = () =>
{
    const [deskData, setDeskData] = useState([]);
    const [editingRows, setEditingRows] = useState(new Set());
    const [originalData, setOriginalData] = useState({});
    const deskService = useMemo(() => new DeskService(), []);
    const loggerService = useRef(new LoggerService(NotionalLimitsGridComponent.name)).current;

    useEffect(() =>
    {
        loadDeskData().then(() => loggerService.logInfo("Desk reference data loaded successfully"));
    }, []);

    const loadDeskData = useCallback(async () =>
    {
        try
        {
            await deskService.loadDesks();
            const desks = deskService.getDesks();

            const transformedData = await Promise.all(desks.map(async (desk) =>
            {
                try
                {
                    loggerService.logInfo(`Loading notional limits for desk ${desk.deskId}`);
                    const response = await fetch(`http://localhost:20017/desk/limits/${desk.deskId}`);
                    let limitData = {
                        buyNotionalLimit: 0,
                        sellNotionalLimit: 0,
                        grossNotionalLimit: 0
                    };
                    
                    if (response.ok)
                    {
                        const limits = await response.json();
                        limitData = {
                            buyNotionalLimit: limits.buyNotionalLimit || 0,
                            sellNotionalLimit: limits.sellNotionalLimit || 0,
                            grossNotionalLimit: limits.grossNotionalLimit || 0
                        };
                    }
                    
                    return {
                        deskId: desk.deskId,
                        deskName: desk.deskName,
                        ...limitData
                    };
                }
                catch (limitError)
                {
                    loggerService.logError(`Failed to load limits for desk ${desk.deskId}: ${limitError}`);
                    return {
                        deskId: desk.deskId,
                        deskName: desk.deskName,
                        buyNotionalLimit: 0,
                        sellNotionalLimit: 0,
                        grossNotionalLimit: 0
                    };
                }
            }));
            
            setDeskData(transformedData);
        }
        catch (error)
        {
            loggerService.logError(`Failed to load desk data: ${error}`);
        }
    }, [deskService, loggerService]);

    const handleEdit = useCallback((data) =>
    {
        setEditingRows(prev => new Set(prev).add(data.deskId));
        setOriginalData(prev =>
        ({
            ...prev,
            [data.deskId]: {
                buyNotionalLimit: data.buyNotionalLimit,
                sellNotionalLimit: data.sellNotionalLimit,
                grossNotionalLimit: data.grossNotionalLimit
            }
        }));
    }, []);

    const handleCancel = useCallback((data) =>
    {
        setEditingRows(prev => {
            const newSet = new Set(prev);
            newSet.delete(data.deskId);
            return newSet;
        });
        
        // Revert to original values
        setDeskData(prev => prev.map(desk => 
            desk.deskId === data.deskId 
                ? {
                    ...desk,
                    buyNotionalLimit: originalData[data.deskId]?.buyNotionalLimit || 0,
                    sellNotionalLimit: originalData[data.deskId]?.sellNotionalLimit || 0,
                    grossNotionalLimit: originalData[data.deskId]?.grossNotionalLimit || 0
                }
                : desk
        ));
        
        // Clean up original data
        setOriginalData(prev =>
        {
            const newData = { ...prev };
            delete newData[data.deskId];
            return newData;
        });
    }, [originalData]);

    const handleSave = useCallback(async (data) =>
    {
        try
        {
            loggerService.logInfo(`Saving notional limits for desk ${data.deskId}`);
            const response = await fetch(`http://localhost:20017/desk/limits/`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    deskId: data.deskId,
                    buyNotionalLimit: data.buyNotionalLimit,
                    sellNotionalLimit: data.sellNotionalLimit,
                    grossNotionalLimit: data.grossNotionalLimit
                })
            });

            if (response.ok)
            {
                // Exit edit mode
                setEditingRows(prev =>
                {
                    const newSet = new Set(prev);
                    newSet.delete(data.deskId);
                    return newSet;
                });
                
                // Clean up original data
                setOriginalData(prev =>
                {
                    const newData = { ...prev };
                    delete newData[data.deskId];
                    return newData;
                });
                
                // Reload data to ensure consistency
                await loadDeskData();
            }
            else
            {
                loggerService.logError(`Failed to save limits: ${response.status}`);
            }
        }
        catch (error)
        {
            loggerService.logError(`Error saving limits: ${error}`);
        }
    }, [loadDeskData, loggerService]);

    const handleCellValueChanged = useCallback((params) =>
    {
        if (editingRows.has(params.data.deskId))
        {
            setDeskData(prev => prev.map(desk => 
                desk.deskId === params.data.deskId 
                    ? { ...desk, [params.colDef.field]: params.newValue }
                    : desk
            ));
        }
    }, [editingRows]);

    const NotionalLimitsActionRenderer = useCallback(({data}) =>
    {
        const isEditing = editingRows.has(data.deskId);

        return (
            <div>
                {!isEditing ? (
                    <Tooltip title="Edit limits">
                        <EditIcon 
                            onClick={() => handleEdit(data)} 
                            style={{cursor: 'pointer', marginRight: '5px', color:'#404040', height:'20px'}}/>
                    </Tooltip>
                ) : (
                    <>
                        <Tooltip title="Save changes">
                            <SaveIcon 
                                onClick={() => handleSave(data)} 
                                style={{cursor: 'pointer', marginRight: '5px', color:'#404040', height:'20px'}}/>
                        </Tooltip>
                        <Tooltip title="Cancel changes">
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
        { headerName: 'Desk Id', field: 'deskId', hide: true, filter: true},
        { headerName: 'Desk Name', field: 'deskName', filter: true, editable: false},
        { 
            headerName: 'Buy Notional Limit', 
            field: 'buyNotionalLimit', 
            valueFormatter: numberFormatter,
            editable: (params) => editingRows.has(params.data.deskId),
            cellEditor: 'agNumberCellEditor',
            cellEditorParams: {
                min: 0
            }
        },
        { 
            headerName: 'Sell Notional Limit', 
            field: 'sellNotionalLimit', 
            valueFormatter: numberFormatter,
            editable: (params) => editingRows.has(params.data.deskId),
            cellEditor: 'agNumberCellEditor',
            cellEditorParams: {
                min: 0
            }
        },
        { 
            headerName: 'Gross Notional Limit', 
            field: 'grossNotionalLimit', 
            valueFormatter: numberFormatter,
            editable: (params) => editingRows.has(params.data.deskId),
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
            cellRenderer: NotionalLimitsActionRenderer,
            width: 120
        }
    ]), [editingRows, NotionalLimitsActionRenderer]);

    return (
        <div className="notional-limits-grid">
            <GenericGridComponent 
                rowHeight={22} 
                gridTheme={"ag-theme-alpine"} 
                rowIdArray={["deskId"]} 
                columnDefs={columnDefs} 
                gridData={deskData} 
                handleAction={null}
                onCellValueChanged={handleCellValueChanged}/>
        </div>
    );
}

export default NotionalLimitsGridComponent;
