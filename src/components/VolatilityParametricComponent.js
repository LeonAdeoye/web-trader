import {useEffect, useMemo, useCallback, useState, useRef} from "react";
import {AgGridReact} from "ag-grid-react";
import {useRecoilState} from "recoil";
import { ServiceRegistry } from "../services/ServiceRegistry";
import {LoggerService} from "../services/LoggerService";
import {formatDate, numberFormatter} from "../utilities";
import {parametricDialogDisplayState} from "../atoms/dialog-state";
import ActionIconsRenderer from "./ActionIconsRenderer";
import ParametricDialog from "../dialogs/ParametricDialog";
import DeleteConfirmationDialog from "../dialogs/DeleteConfirmationDialog";

export const VolatilityParametricComponent = () =>
{
    const [volatilities, setVolatilities] = useState([]);
    const [instruments, setInstruments] = useState([]);
    const [ownerId, setOwnerId] = useState('');
    const volatilityService = useRef(ServiceRegistry.getVolatilityService()).current;
    const instrumentService = useRef(ServiceRegistry.getInstrumentService()).current;
    const loggerService = useRef(new LoggerService(VolatilityParametricComponent.name)).current;
    const [, setDialogState] = useRecoilState(parametricDialogDisplayState);
    const [deleteOpen, setDeleteOpen] = useState(false);
    const [dataToDelete, setDataToDelete] = useState(null);

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
                await volatilityService.loadVolatilities();
                let loadedVolatilities = volatilityService.getVolatilities();
                if (loadedVolatilities.length === 0 && loadedInstruments.length > 0)
                    loadedVolatilities = volatilityService.createDefaultVolatilities(loadedInstruments, 20.0);
                
                setVolatilities(loadedVolatilities);
            }
            catch (error)
            {
                loggerService.logError(`Error loading data: ${error.message}`);
            }
        };
        
        loadData();
    }, [volatilityService, instrumentService, loggerService]);

    const onCellValueChanged = useCallback(async (params) =>
    {
        if (params.colDef.field === 'volatilityPercentage')
        {
            try
            {
                const { data } = params;
                const newVolatility = parseFloat(params.newValue);
                
                if (isNaN(newVolatility) || newVolatility < 0 || newVolatility > 100)
                {
                    params.node.setDataValue('volatilityPercentage', params.oldValue);
                    return;
                }

                const updatedVolatility = await volatilityService.updateVolatility(
                    data.instrumentCode, 
                    newVolatility, 
                    ownerId
                );

                setVolatilities(prev => prev.map(v => v.instrumentCode === data.instrumentCode ? updatedVolatility : v));
                
                loggerService.logInfo(`Successfully updated volatility for ${data.instrumentCode} to ${newVolatility}%`);
                
            }
            catch (error)
            {
                loggerService.logError(`Error updating volatility: ${error.message}`);
                params.node.setDataValue('volatilityPercentage', params.oldValue);
            }
        }
    }, [volatilityService, loggerService, ownerId]);

    const handleAction = useCallback((action, data) =>
    {
        switch (action)
        {
            case "add":
                setDialogState({ open: true, mode: 'add', data: null, kind: 'volatility' });
                break;
            case "update":
                setDialogState({ open: true, mode: 'update', data, kind: 'volatility' });
                break;
            case "clone":
                setDialogState({ open: true, mode: 'clone', data, kind: 'volatility' });
                break;
            case "delete":
                setDataToDelete(data);
                setDeleteOpen(true);
                break;
            default:
                loggerService.logError(`Unknown action: ${action}`);
        }
    }, [loggerService, setDialogState]);

    const handleSave = useCallback(async (formData) =>
    {
        try
        {
            const percentage = parseFloat(formData.volatilityPercentage);
            const updated = await volatilityService.updateVolatility(formData.instrumentCode, percentage, ownerId);
            setVolatilities(prev =>
            {
                const exists = prev.some(item => item.instrumentCode === updated.instrumentCode);
                if (exists)
                    return prev.map(item => item.instrumentCode === updated.instrumentCode ? updated : item);
                return [...prev, updated];
            });
        }
        catch (error)
        {
            loggerService.logError(`Error saving volatility: ${error.message}`);
            throw error;
        }
    }, [volatilityService, ownerId, loggerService]);

    const handleDeleteConfirm = useCallback(async () =>
    {
        if (!dataToDelete)
            return;

        await volatilityService.deleteVolatility(dataToDelete.instrumentCode);
        setVolatilities(prev => prev.filter(item => item.instrumentCode !== dataToDelete.instrumentCode));
        setDeleteOpen(false);
        setDataToDelete(null);
    }, [dataToDelete, volatilityService]);

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
            headerName: "Volatility %",
            field: "volatilityPercentage",
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
        },
        {
            headerName: 'Actions',
            field: 'actions',
            sortable: false,
            width: 140,
            filter: false,
            editable: false,
            cellRenderer: ActionIconsRenderer
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
        <>
        <div className="ag-theme-alpine volatility-parametric" style={{ height: '100%', width: '100%' }}>
            <AgGridReact
                columnDefs={columnDefs}
                rowData={volatilities}
                defaultColDef={defaultColDef}
                onGridReady={onGridReady}
                onCellValueChanged={onCellValueChanged}
                rowHeight={22}
                headerHeight={22}
                getRowId={(params) => params.data.instrumentCode}
                context={{handleAction}}
                enableCellChangeFlash={true}
                animateRows={true}
                suppressRowClickSelection={true}/>
        </div>
        <ParametricDialog dataName="Volatility" kind="volatility" instruments={instruments} onSave={handleSave} />
        <DeleteConfirmationDialog open={deleteOpen} onClose={() => { setDeleteOpen(false); setDataToDelete(null); }}
            onConfirm={handleDeleteConfirm} dataToDelete={dataToDelete} selectedTab="volatility"
            getDataName={() => "Volatility"} getItemDisplayName={(item) => item?.instrumentCode || ''} />
        </>
    );
}
