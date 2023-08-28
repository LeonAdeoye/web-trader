import * as React from 'react';
import {AgGridReact} from "ag-grid-react";
import {useCallback, useMemo, useRef, useState, useEffect} from "react";
import {createRowId, getRowIdValue} from "../utilities";
import {selectedGenericGridRowState} from "../atoms/dialog-state";
import {useRecoilState} from "recoil";

export const GenericGridApp = ({rowHeight, gridTheme, rowIdArray, columnDefs, gridData}) =>
{
    const gridApiRef = useRef();
    const gridDimensions = useMemo(() => ({ height: '100%', width: '100%' }), []);
    const defaultColDef = useMemo(() => ({resizable: true, filter: true, sortable: true}), []);
    const [, setSelectedGenericGridRow] = useRecoilState(selectedGenericGridRowState);

    const getRowId = useMemo(() => (row) =>
    {
        return getRowIdValue(rowIdArray, row.data);
    }, []);

    const onSelectionChanged = () =>
    {
        const selectedRows = gridApiRef.current.api.getSelectedRows();
        if(selectedRows.length === 1)
            setSelectedGenericGridRow(selectedRows[0]);
    };

    const updateRows = useCallback((row) =>
    {
        gridApiRef.current.api.forEachNode((rowNode) =>
        {
            if (rowNode.data[createRowId(rowIdArray)] !== row[createRowId(rowIdArray)])
                return;

            rowNode.updateData({...rowNode.data, ...row});
        });
    }, []);

    // TODO move dimensions to style sheet
    return (
        <div className={gridTheme} style={gridDimensions}>
            <AgGridReact
                ref={gridApiRef}
                columnDefs={columnDefs}
                rowData={gridData}
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
