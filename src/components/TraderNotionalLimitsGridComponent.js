import {useEffect, useMemo, useCallback, useState, useRef} from "react";
import {numberFormatter} from "../utilities";
import {DeskService} from "../services/DeskService";
import {TraderService} from "../services/TraderService";
import {LimitsService} from "../services/LimitsService";
import {LoggerService} from "../services/LoggerService";
import * as React from "react";
import EditIcon from "@mui/icons-material/Edit";
import CancelIcon from "@mui/icons-material/Cancel";
import SaveIcon from "@mui/icons-material/Save";
import {Tooltip} from "@mui/material";
import {AgGridReact} from "ag-grid-react";
import ErrorMessageComponent from "./ErrorMessageComponent";

const TraderNotionalLimitsGridComponent = () =>
{
    const [traderData, setTraderData] = useState([]);
    const [editingRow, setEditingRow] = useState(null);
    const [originalData, setOriginalData] = useState({});
    const [errorMessage, setErrorMessage] = useState(null);
    const deskService = useMemo(() => new DeskService(), []);
    const traderService = useMemo(() => new TraderService(), []);
    const limitsService = useMemo(() => new LimitsService(), []);
    const loggerService = useRef(new LoggerService(TraderNotionalLimitsGridComponent.name)).current;

    useEffect(() =>
    {
        loadTraderData().then(() => loggerService.logInfo("Trader notional limits loaded successfully"));
    }, []);

    const loadTraderData = useCallback(async () =>
    {
        try
        {
            await traderService.loadTraders();
            await deskService.loadDesks();
            const traders = traderService.getTraders();
            const desks = deskService.getDesks();
            let limitsData = [];
            try
            {
                limitsData = await limitsService.getTraderNotionalLimits();
            }
            catch (error)
            {
                setErrorMessage(`Failed to fetch trader notional limits from REST limits service: ${error.message}`);
            }

            const transformedData = traders.map((trader) =>
            {
                const limit = limitsData.find(l => l.traderId === trader.traderId);
                const desk = desks.find(d => (d.traders || []).includes(trader.traderId));

                return {
                    traderId: trader.traderId,
                    traderName: `${trader.firstName || ""} ${trader.lastName || ""}`.trim(),
                    deskName: desk?.deskName || "",
                    buyNotionalLimit: limit?.buyNotionalLimit || 0,
                    sellNotionalLimit: limit?.sellNotionalLimit || 0,
                    grossNotionalLimit: limit?.grossNotionalLimit || 0
                };
            });

            setTraderData(transformedData);
        }
        catch (error)
        {
            loggerService.logError(`Failed to load trader data: ${error}`);
            setErrorMessage("Failed to load trader notional limits from REST limits service");
        }
    }, [deskService, traderService, limitsService, loggerService]);

    const handleEdit = useCallback((data) =>
    {
        setEditingRow(data.traderId);
        setOriginalData(prev => ({
            ...prev,
            [data.traderId]: {
                buyNotionalLimit: data.buyNotionalLimit,
                sellNotionalLimit: data.sellNotionalLimit,
                grossNotionalLimit: data.grossNotionalLimit
            }
        }));
    }, []);

    const handleCancel = useCallback((data) =>
    {
        setEditingRow(null);
        setTraderData(prev => prev.map(trader =>
            trader.traderId === data.traderId
                ? {
                    ...trader,
                    buyNotionalLimit: originalData[data.traderId]?.buyNotionalLimit || 0,
                    sellNotionalLimit: originalData[data.traderId]?.sellNotionalLimit || 0,
                    grossNotionalLimit: originalData[data.traderId]?.grossNotionalLimit || 0
                }
                : trader));

        setOriginalData({});
    }, [originalData]);

    const handleSave = useCallback(async (data) =>
    {
        setEditingRow(null);
        setOriginalData({});
        try
        {
            loggerService.logInfo(`Saving notional limits for trader ${data.traderId}`);
            await limitsService.saveTraderNotionalLimit({
                traderId: data.traderId,
                buyNotionalLimit: data.buyNotionalLimit,
                sellNotionalLimit: data.sellNotionalLimit,
                grossNotionalLimit: data.grossNotionalLimit
            });
            await loadTraderData();
        }
        catch (error)
        {
            loggerService.logError(`Error saving trader limits: ${error}`);
            setErrorMessage(`Failed to save trader notional limits to REST limits service: ${error.message}`);
        }
    }, [loggerService, limitsService, loadTraderData]);

    const TraderLimitsActionRenderer = useCallback(({data}) =>
    {
        const isEditingThisRow = editingRow === data.traderId;
        const isAnyRowEditing = editingRow !== null;

        return (
            <div>
                {!isEditingThisRow ? (
                    <Tooltip title="Edit notional limits for this trader">
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
                        <Tooltip title="Save changes to trader notional limits">
                            <SaveIcon
                                onClick={() => handleSave(data)}
                                style={{cursor: 'pointer', marginRight: '5px', color:'#404040', height:'20px'}}/>
                        </Tooltip>
                        <Tooltip title="Cancel changes to trader notional limits">
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
        { headerName: 'Trader Id', field: 'traderId', hide: true, filter: true},
        { headerName: 'Trader', field: 'traderName', filter: true, editable: false},
        { headerName: 'Desk', field: 'deskName', filter: true, editable: false},
        {
            headerName: 'Buy Notional Limit',
            field: 'buyNotionalLimit',
            valueFormatter: numberFormatter,
            editable: (params) => editingRow === params.data.traderId,
            cellEditor: 'agNumberCellEditor',
            cellEditorParams: {
                min: 0
            }
        },
        {
            headerName: 'Sell Notional Limit',
            field: 'sellNotionalLimit',
            valueFormatter: numberFormatter,
            editable: (params) => editingRow === params.data.traderId,
            cellEditor: 'agNumberCellEditor',
            cellEditorParams: {
                min: 0
            }
        },
        {
            headerName: 'Gross Notional Limit',
            field: 'grossNotionalLimit',
            valueFormatter: numberFormatter,
            editable: (params) => editingRow === params.data.traderId,
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
            cellRenderer: TraderLimitsActionRenderer,
            width: 120
        }
    ]), [editingRow, TraderLimitsActionRenderer]);

    return (
        <>
            <div className="ag-theme-alpine notional-limits-grid" style={{ height: '100%', width: '100%' }}>
                <AgGridReact rowData={traderData} columnDefs={columnDefs} rowHeight={22} headerHeight={22} getRowId={params => params.data.traderId}/>
            </div>
            {errorMessage ? (<ErrorMessageComponent message={errorMessage} duration={3000} onDismiss={() => setErrorMessage(null)} position="bottom-right" maxWidth="900px"/>): null}
        </>
    );
}

export default TraderNotionalLimitsGridComponent;
