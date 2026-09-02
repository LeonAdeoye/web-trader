import {useEffect, useMemo, useCallback, useState, useRef} from "react";
import {AgGridReact} from "ag-grid-react";
import { ServiceRegistry } from "../services/ServiceRegistry";
import {LoggerService} from "../services/LoggerService";
import {formatDate, numberFormatter} from "../utilities";

export const AdvParametricComponent = () =>
{
    const [advs, setAdvs] = useState([]);
    const [instruments, setInstruments] = useState([]);
    const [ownerId, setOwnerId] = useState('');
    const advService = useRef(ServiceRegistry.getAdvService()).current;
    const instrumentService = useRef(ServiceRegistry.getInstrumentService()).current;
    const loggerService = useRef(new LoggerService(AdvParametricComponent.name)).current;

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
            valueFormatter: (params) => numberFormatter(params.value, 0),
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
                enableCellChangeFlash={true}
                animateRows={true}
                suppressRowClickSelection={true}/>
        </div>
    );
}
