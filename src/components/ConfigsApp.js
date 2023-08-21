import * as React from 'react';
import {AgGridReact} from "ag-grid-react";
import {useCallback, useMemo, useRef, useState, useEffect} from "react";

export const ConfigsApp = () =>
{
    const [configs, setConfigs]  = useState([]);
    const gridApiRef = useRef();
    const gridDimensions = useMemo(() => ({ height: '100%', width: '100%' }), []);

    const [columnDefs] = useState([
        { field: 'owner', sortable: true, minWidth: 100, width: 130 },
        { field: 'key', sortable: true, minWidth: 150, width: 200 },
        { field: 'value', sortable: true, minWidth: 200, width: 470 },
        { field: 'lastUpdatedBy', sortable: true, minWidth: 100, maxWidth: 170, width: 170 },
        { headerName: "Last Updated On", field: 'lastUpdatedOn', sortable: true, minWidth: 200, maxWidth: 200, width: 200, valueGetter: (params) =>
        {
            let timestamp = Number((params.data.lastUpdatedOn));
            return transformLocalDataTime(timestamp.valueOf());
        }}]
    );

    const  transformLocalDataTime = (epochTimeInUTC) => new Date(epochTimeInUTC).toLocaleString();

    const defaultColDef = useMemo(() => ({resizable: true, filter: true, sortable: true}), []);

    const getRowId = useMemo(() => (row) => row.data.symbol, []);

    const onSelectionChanged = useCallback(() =>
    {
        console.log("onSelectionChanged");
        const selectedRows = gridApiRef.current.api.getSelectedRows();
    }, []);

    useEffect(() =>
    {
        fetch("http://localhost:20001/configurations")
            .then((response) => response.json())
            .then((data) => setConfigs(data))
            .catch((error) => console.log(error));
    }, []);

    return (
        <div className="ag-theme-alpine" style={gridDimensions}>
            <AgGridReact
                ref={gridApiRef}
                columnDefs={columnDefs}
                rowData={configs}
                defaultColDef={defaultColDef}
                enableCellChangeFlash={true}
                rowSelection={'single'}
                onSelectionChanged={onSelectionChanged}
                animateRows={true}
                getRowId={getRowId}
                rowHeight={25}
            />
        </div>
    );
};
