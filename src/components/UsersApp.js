import * as React from 'react';
import {AgGridReact} from "ag-grid-react";
import {useCallback, useMemo, useRef, useState, useEffect} from "react";

export const UsersApp = () =>
{
    const [users, setUsers]  = useState([]);
    const gridApiRef = useRef();
    const gridDimensions = useMemo(() => ({ height: '100%', width: '100%' }), []);

    const [columnDefs] = useState( [
            { field: "userId", sortable: true, minWidth: 100, width: 130 },
            { field: "fullName", sortable: true, minWidth: 250, width: 250 },
            { field: "region", sortable: true, minWidth: 100, width: 100 },
            { field: "countryCode", sortable: true, minWidth: 150, width: 150 },
            { field: "location", sortable: true, minWidth: 150, maxWidth: 150, width: 150},
            { field: "deskName", sortable: true, minWidth: 250, width: 150},
            { field: "isActive", minWidth: 120, maxWidth: 120, width: 120 }
        ]);

    const defaultColDef = useMemo(() => ({resizable: true, filter: true, sortable: true}), []);

    const getRowId = useMemo(() => (row) => row.data.symbol, []);

    const onSelectionChanged = useCallback(() =>
    {
        console.log("onSelectionChanged");
        const selectedRows = gridApiRef.current.api.getSelectedRows();
    }, []);

    useEffect(() =>
    {
        fetch("localhost:20003/users").then((data) =>
        {

        });
    }, []);

    const updateRows = useCallback((user) =>
    {
        gridApiRef.current.api.forEachNode((rowNode) =>
        {
            if (rowNode.data.userId !== user.userId)
                return;

            rowNode.updateData({...rowNode.data, ...user});
        });
    }, []);

    return (
        <div className="ag-theme-alpine" style={gridDimensions}>
            <AgGridReact
                ref={gridApiRef}
                columnDefs={columnDefs}
                rowData={users}
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
