import { AgGridReact } from 'ag-grid-react';
import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-alpine.css';
import React, { useEffect, useState, useRef, useMemo } from "react";
import TitleBarComponent from "../components/TitleBarComponent";
import { ServiceRegistry } from '../services/ServiceRegistry';
import { LoggerService } from '../services/LoggerService';

export const NewsApp = () =>
{
    const [instruments, setInstruments] = useState([]);
    const instrumentService = useRef(ServiceRegistry.getInstrumentService()).current;
    const newsService = useRef(ServiceRegistry.getNewsService()).current;
    const loggerService = useRef(new LoggerService(NewsApp.name)).current;
    const windowId = useMemo(() => window.command.getWindowId("News"), []);

    const gridApiRef = useRef();

    const columnDefs = useMemo(() =>
        ([
            { headerName: 'RIC', field: 'ric', sortable: true, minWidth: 120, width: 120, filter: true },
        ]), []);

    useEffect(() =>
    {
        const loadInstruments = async () =>
        {
            try
            {
                await newsService.loadSymbolsWithNews()
                const instrumentsData = newsService.getInstruments().map(ric => ({ ric }));
                setInstruments(instrumentsData);
            }
            catch (error)
            {
                loggerService.logError(`Failed to load instruments: ${error.message}`);
            }
        };

        loadInstruments().then(() => loggerService.logInfo("Instruments loaded successfully."));
    }, [instrumentService]);

    useEffect(() =>
    {
        const api = gridApiRef.current?.api;
        if (api)
            api.refreshCells({ columns: ['actions'], force: true });
    }, []);

    return (
        <div>
            <TitleBarComponent
                title="News"
                windowId={windowId}
                addButtonProps={undefined}
                showChannel={false}
                showTools={false}/>

            <div className="ag-theme-alpine" style={{
                width: '100%',
                height: 'calc(100vh - 65px)',
                float: 'left',
                padding: '0px',
                margin: '45px 0px 0px 0px'
            }}>
                <AgGridReact
                    columnDefs={columnDefs}
                    ref={gridApiRef}
                    rowSelection={'single'}
                    rowHeight={25}
                    rowData={instruments}
                    getRowId={({ data: { ric } }) => ric}
                    defaultColDef={{ resizable: true, sortable: true, filter: true, floatingFilter: false }}/>
            </div>
        </div>
    );
};
