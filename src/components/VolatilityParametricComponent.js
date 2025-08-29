import {useEffect, useMemo, useCallback, useState, useRef} from "react";
import {AgGridReact} from "ag-grid-react";
import {VolatilityService} from "../services/VolatilityService";
import {InstrumentService} from "../services/InstrumentService";
import {LoggerService} from "../services/LoggerService";
import {formatDate, numberFormatter} from "../utilities";

export const VolatilityParametricComponent = () =>
{
    const [volatilities, setVolatilities] = useState([]);
    const [instruments, setInstruments] = useState([]);
    const [ownerId, setOwnerId] = useState('');
    const volatilityService = useRef(new VolatilityService()).current;
    const instrumentService = useRef(new InstrumentService()).current;
    const loggerService = useRef(new LoggerService(VolatilityParametricComponent.name)).current;

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
                enableCellChangeFlash={true}
                animateRows={true}
                suppressRowClickSelection={true}/>
        </div>
    );
}
