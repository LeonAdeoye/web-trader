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

export const AdvParametricComponent = () =>
{
    const [advs, setAdvs] = useState([]);
    const [instruments, setInstruments] = useState([]);
    const [ownerId, setOwnerId] = useState('');
    const advService = useRef(ServiceRegistry.getAdvService()).current;
    const instrumentService = useRef(ServiceRegistry.getInstrumentService()).current;
    const loggerService = useRef(new LoggerService(AdvParametricComponent.name)).current;
    const [, setDialogState] = useRecoilState(parametricDialogDisplayState);
    const [deleteOpen, setDeleteOpen] = useState(false);
    const [dataToDelete, setDataToDelete] = useState(null);

    useEffect(() =>
    {
        const loadOwner = async () => setOwnerId(await window.configurations.getLoggedInUserId());

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
                await advService.loadAdvs();
                let loadedAdvs = advService.getAdvs();
                if (loadedAdvs.length === 0 && loadedInstruments.length > 0)
                    loadedAdvs = await advService.createDefaultAdvs(loadedInstruments, ownerId || 'System');

                setAdvs(loadedAdvs);
            }
            catch (error)
            {
                loggerService.logError(`Error loading data: ${error.message}`);
            }
        };

        loadData();
    }, [advService, instrumentService, loggerService, ownerId]);

    const onCellValueChanged = useCallback(async (params) =>
    {
        if (params.colDef.field === 'adv')
        {
            try
            {
                const { data } = params;
                const newAdv = parseInt(params.newValue, 10);

                if (isNaN(newAdv) || newAdv < 0)
                {
                    params.node.setDataValue('adv', params.oldValue);
                    return;
                }

                const updatedAdv = await advService.updateAdv(data.instrumentCode, newAdv, ownerId);

                setAdvs(prev => prev.map(item => item.instrumentCode === data.instrumentCode ? updatedAdv : item));

                loggerService.logInfo(`Successfully updated ADV for ${data.instrumentCode} to ${newAdv}`);
            }
            catch (error)
            {
                loggerService.logError(`Error updating ADV: ${error.message}`);
                params.node.setDataValue('adv', params.oldValue);
            }
        }
    }, [advService, loggerService, ownerId]);

    const handleAction = useCallback((action, data) =>
    {
        switch (action)
        {
            case "add":
                setDialogState({ open: true, mode: 'add', data: null, kind: 'adv' });
                break;
            case "update":
                setDialogState({ open: true, mode: 'update', data, kind: 'adv' });
                break;
            case "clone":
                setDialogState({ open: true, mode: 'clone', data, kind: 'adv' });
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
            const adv = parseInt(formData.adv, 10);
            const updated = await advService.updateAdv(formData.instrumentCode, adv, ownerId);
            setAdvs(prev =>
            {
                const exists = prev.some(item => item.instrumentCode === updated.instrumentCode);
                if (exists)
                    return prev.map(item => item.instrumentCode === updated.instrumentCode ? updated : item);
                return [...prev, updated];
            });
        }
        catch (error)
        {
            loggerService.logError(`Error saving ADV: ${error.message}`);
            throw error;
        }
    }, [advService, ownerId, loggerService]);

    const handleDeleteConfirm = useCallback(async () =>
    {
        if (!dataToDelete)
            return;

        await advService.deleteAdv(dataToDelete.instrumentCode);
        setAdvs(prev => prev.filter(item => item.instrumentCode !== dataToDelete.instrumentCode));
        setDeleteOpen(false);
        setDataToDelete(null);
    }, [dataToDelete, advService]);

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
            headerName: "ADV",
            field: "adv",
            sortable: true,
            filter: true,
            minWidth: 140,
            width: 140,
            editable: true,
            type: 'numericColumn',
            valueFormatter: numberFormatter,
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
        <div className="ag-theme-alpine adv-parametric" style={{ height: '100%', width: '100%' }}>
            <AgGridReact
                columnDefs={columnDefs}
                rowData={advs}
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
        <ParametricDialog dataName="ADV" kind="adv" instruments={instruments} onSave={handleSave} />
        <DeleteConfirmationDialog open={deleteOpen} onClose={() => { setDeleteOpen(false); setDataToDelete(null); }}
            onConfirm={handleDeleteConfirm} dataToDelete={dataToDelete} selectedTab="adv"
            getDataName={() => "ADV"} getItemDisplayName={(item) => item?.instrumentCode || ''} />
        </>
    );
}
