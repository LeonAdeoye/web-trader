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

export const InterestRateParametricComponent = () =>
{
    const [rates, setRates] = useState([]);
    const [ownerId, setOwnerId] = useState('');
    const rateService = useRef(ServiceRegistry.getRateService()).current;
    const loggerService = useRef(new LoggerService(InterestRateParametricComponent.name)).current;
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
                await rateService.loadRates();
                let loadedRates = rateService.getRates();
                if (loadedRates.length === 0)
                    loadedRates = rateService.createDefaultRates(5.0);
                setRates(loadedRates);
            }
            catch (error)
            {
                loggerService.logError(`Error loading data: ${error.message}`);
            }
        };
        
        loadData();
    }, [rateService, loggerService]);

    const onCellValueChanged = useCallback(async (params) =>
    {
        if (params.colDef.field === 'interestRatePercentage')
        {
            try
            {
                const { data } = params;
                const newRate = parseFloat(params.newValue);
                
                if (isNaN(newRate) || newRate < 0 || newRate > 100)
                {
                    params.node.setDataValue('interestRatePercentage', params.oldValue);
                    return;
                }

                const updatedRate = await rateService.updateRate(
                    data.currencyCode, 
                    newRate, 
                    ownerId
                );

                setRates(prev => prev.map(r => r.currencyCode === data.currencyCode ? updatedRate : r));
                
                loggerService.logInfo(`Successfully updated interest rate for ${data.currencyCode} to ${newRate}%`);
                
            }
            catch (error)
            {
                loggerService.logError(`Error updating interest rate: ${error.message}`);
                params.node.setDataValue('interestRatePercentage', params.oldValue);
            }
        }
    }, [rateService, loggerService, ownerId]);

    const handleAction = useCallback((action, data) =>
    {
        switch (action)
        {
            case "add":
                setDialogState({ open: true, mode: 'add', data: null, kind: 'rate' });
                break;
            case "update":
                setDialogState({ open: true, mode: 'update', data, kind: 'rate' });
                break;
            case "clone":
                setDialogState({ open: true, mode: 'clone', data, kind: 'rate' });
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
            const percentage = parseFloat(formData.interestRatePercentage);
            const updated = await rateService.updateRate(formData.currencyCode, percentage, ownerId);
            setRates(prev =>
            {
                const exists = prev.some(item => item.currencyCode === updated.currencyCode);
                if (exists)
                    return prev.map(item => item.currencyCode === updated.currencyCode ? updated : item);
                return [...prev, updated];
            });
        }
        catch (error)
        {
            loggerService.logError(`Error saving interest rate: ${error.message}`);
            throw error;
        }
    }, [rateService, ownerId, loggerService]);

    const handleDeleteConfirm = useCallback(async () =>
    {
        if (!dataToDelete)
            return;

        await rateService.deleteRate(dataToDelete.currencyCode);
        setRates(prev => prev.filter(item => item.currencyCode !== dataToDelete.currencyCode));
        setDeleteOpen(false);
        setDataToDelete(null);
    }, [dataToDelete, rateService]);

    const columnDefs = useMemo(() =>
    [
        {
            headerName: "Currency",
            field: "currencyCode",
            sortable: true,
            filter: true,
            minWidth: 150,
            width: 150,
            editable: false
        },
        {
            headerName: "Interest Rate %",
            field: "interestRatePercentage",
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
    ], []);

    const defaultColDef = useMemo(() =>
    ({
        resizable: true,
        filter: true,
        sortable: true
    }), []);

    const onGridReady = useCallback((params) =>
    {
        params.columnApi.applyColumnState({
            state: [{ colId: 'currencyCode', sort: 'asc' }],
            applyOrder: true,
        });
    }, []);

    return (
        <>
        <div className="ag-theme-alpine interest-rate-parametric" style={{ height: '100%', width: '100%' }}>
            <AgGridReact
                columnDefs={columnDefs}
                rowData={rates}
                defaultColDef={defaultColDef}
                onGridReady={onGridReady}
                onCellValueChanged={onCellValueChanged}
                rowHeight={22}
                headerHeight={22}
                getRowId={(params) => params.data.currencyCode}
                context={{handleAction}}
                enableCellChangeFlash={true}
                animateRows={true}
                suppressRowClickSelection={true}/>
        </div>
        <ParametricDialog dataName="Interest Rate" kind="rate" onSave={handleSave} />
        <DeleteConfirmationDialog open={deleteOpen} onClose={() => { setDeleteOpen(false); setDataToDelete(null); }}
            onConfirm={handleDeleteConfirm} dataToDelete={dataToDelete} selectedTab="rate"
            getDataName={() => "Interest Rate"} getItemDisplayName={(item) => item?.currencyCode || ''} />
        </>
    );
}
