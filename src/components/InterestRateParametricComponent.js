import {useEffect, useMemo, useCallback, useState, useRef} from "react";
import {AgGridReact} from "ag-grid-react";
import {RateService} from "../services/RateService";
import {LoggerService} from "../services/LoggerService";
import {formatDate, numberFormatter} from "../utilities";

export const InterestRateParametricComponent = () =>
{
    const [rates, setRates] = useState([]);
    const [currencies, setCurrencies] = useState([]);
    const [ownerId, setOwnerId] = useState('');

    const rateService = useRef(new RateService()).current;
    const loggerService = useRef(new LoggerService(InterestRateParametricComponent.name)).current;

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
                await rateService.loadCurrencies();
                const loadedCurrencies = rateService.getCurrencies();
                setCurrencies(loadedCurrencies);
                
                await rateService.loadRates();
                let loadedRates = rateService.getRates();
                
                if (loadedRates.length === 0 && loadedCurrencies.length > 0)
                    loadedRates = rateService.createDefaultRates(loadedCurrencies, 5.0);
                
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
        }
    ], [currencies]);

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
                enableCellChangeFlash={true}
                animateRows={true}
                suppressRowClickSelection={true}/>
        </div>
    );
}
