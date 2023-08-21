import * as React from 'react';
import {AgGridReact} from "ag-grid-react";
import {useCallback, useMemo, useRef, useState, useEffect} from "react";
import {createRowId, getRowIdValue} from "../utilities";

export const GenericGridApp = ({initUrl, rowHeight, gridTheme, rowIdArray, columnDefs}) =>
{
    const [rowData, setRowData]  = useState([]);
    const gridApiRef = useRef();
    const gridDimensions = useMemo(() => ({ height: '100%', width: '100%' }), []);
    const defaultColDef = useMemo(() => ({resizable: true, filter: true, sortable: true}), []);

    const getRowId = useMemo(() => (row) =>
    {
        return getRowIdValue(rowIdArray, row.data);
    }, []);

    const onSelectionChanged = () =>
    {
        const selectedRows = gridApiRef.current.api.getSelectedRows();
        console.log("Selected: " + selectedRows.length === 0 ? '' : selectedRows[0][createRowId(rowIdArray)]);
    };

    useEffect(() =>
    {
        fetch(initUrl)
            .then((response) => response.json())
            .then((data) => setRowData(data))
            .catch((error) => console.log(error));
    }, []);

    const updateRows = useCallback((row) =>
    {
        gridApiRef.current.api.forEachNode((rowNode) =>
        {
            if (rowNode.data[createRowId(rowIdArray)] !== row[createRowId(rowIdArray)])
                return;

            rowNode.updateData({...rowNode.data, ...row});
        });
    }, []);

    return (
        <div className={gridTheme} style={gridDimensions}>
            <AgGridReact
                ref={gridApiRef}
                columnDefs={columnDefs}
                rowData={rowData}
                defaultColDef={defaultColDef}
                enableCellChangeFlash={true}
                rowSelection={'single'}
                onSelectionChanged={() => onSelectionChanged()}
                animateRows={true}
                getRowId={getRowId}
                rowHeight={rowHeight}
                headerHeight={rowHeight}
            />
        </div>
    );
};
