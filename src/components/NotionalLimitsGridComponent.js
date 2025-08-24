import {useEffect, useMemo, useCallback, useState, useRef} from "react";
import {numberFormatter} from "../utilities";
import {DeskService} from "../services/DeskService";
import {LoggerService} from "../services/LoggerService";
import * as React from "react";
import EditIcon from "@mui/icons-material/Edit";
import CancelIcon from "@mui/icons-material/Cancel";
import SaveIcon from "@mui/icons-material/Save";
import {Tooltip} from "@mui/material";
import {AgGridReact} from "ag-grid-react";

const NotionalLimitsGridComponent = () =>
{
    const [deskData, setDeskData] = useState([]);
    const [editingRow, setEditingRow] = useState(null);
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

            const response = await fetch("http://localhost:20017/limits/desk");
            let limitsData = [];

            if (response.ok)
                limitsData = await response.json(); // Array of DeskNotionalLimit
            else
                loggerService.logError(`Failed to fetch desk limits: ${response.statusText}`);

            const transformedData = desks.map((desk) =>
            {
                const limit = limitsData.find(l => l.deskId === desk.deskId);

                return {
                    deskId: desk.deskId,
                    deskName: desk.deskName,
                    buyNotionalLimit: limit?.buyNotionalLimit || 0,
                    sellNotionalLimit: limit?.sellNotionalLimit || 0,
                    grossNotionalLimit: limit?.grossNotionalLimit || 0
                };
            });

            setDeskData(transformedData);
        }
        catch (error)
        {
            loggerService.logError(`Failed to load desk data: ${error}`);
        }
    }, [deskService, loggerService]);

    const handleEdit = useCallback((data) =>
    {
        setEditingRow(data.deskId);
        setOriginalData(prev => ({
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
        setEditingRow(null);
        setDeskData(prev => prev.map(desk =>
            desk.deskId === data.deskId
                ? {
                    ...desk,
                    buyNotionalLimit: originalData[data.deskId]?.buyNotionalLimit || 0,
                    sellNotionalLimit: originalData[data.deskId]?.sellNotionalLimit || 0,
                    grossNotionalLimit: originalData[data.deskId]?.grossNotionalLimit || 0
                }
                : desk));

        setOriginalData({});
    }, [originalData]);

    const handleSave = useCallback(async (data) =>
    {
        setEditingRow(null);
        setOriginalData({});
        try
        {
            loggerService.logInfo(`Saving notional limits for desk ${data.deskId}`);
            const response = await fetch(`http://localhost:20017/limits/desk`, {
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

            if (!response.ok)
                loggerService.logError(`Failed to save limits: ${response.status}`);
        }
        catch (error)
        {
            loggerService.logError(`Error saving limits: ${error}`);
        }
    }, [loggerService]);

    const NotionalLimitsActionRenderer = useCallback(({data}) =>
    {
        const isEditingThisRow = editingRow === data.deskId;
        const isAnyRowEditing = editingRow !== null;

        return (
            <div>
                {!isEditingThisRow ? (
                    <Tooltip title="Edit notional limits for this desk">
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
                        <Tooltip title="Save changes to notional limits">
                            <SaveIcon 
                                onClick={() => handleSave(data)} 
                                style={{cursor: 'pointer', marginRight: '5px', color:'#404040', height:'20px'}}/>
                        </Tooltip>
                        <Tooltip title="Cancel changes to notional limits">
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
        { headerName: 'Desk Id', field: 'deskId', hide: true, filter: true},
        { headerName: 'Desk Name', field: 'deskName', filter: true, editable: false},
        { 
            headerName: 'Buy Notional Limit', 
            field: 'buyNotionalLimit', 
            valueFormatter: numberFormatter,
            editable: (params) => editingRow === params.data.deskId,
            cellEditor: 'agNumberCellEditor',
            cellEditorParams: {
                min: 0
            }
        },
        { 
            headerName: 'Sell Notional Limit', 
            field: 'sellNotionalLimit', 
            valueFormatter: numberFormatter,
            editable: (params) => editingRow === params.data.deskId,
            cellEditor: 'agNumberCellEditor',
            cellEditorParams: {
                min: 0
            }
        },
        { 
            headerName: 'Gross Notional Limit', 
            field: 'grossNotionalLimit', 
            valueFormatter: numberFormatter,
            editable: (params) => editingRow === params.data.deskId,
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
    ]), [editingRow, NotionalLimitsActionRenderer]);

    return (
        <div className="ag-theme-alpine notional-limits-grid" style={{ height: '100%', width: '100%' }}>
            <AgGridReact
                rowData={deskData}
                columnDefs={columnDefs}
                rowHeight={22}
                headerHeight={22}
                getRowId={params => params.data.deskId}/>
        </div>
    );
}

export default NotionalLimitsGridComponent;
