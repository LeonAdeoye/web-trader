import * as React from 'react';
import {AgGridReact} from "ag-grid-react";
import {useCallback, useMemo, useRef} from "react";
import {createRowId, getRowIdValue} from "../utilities";
import {selectedContextShareState, selectedGenericGridRowState} from "../atoms/component-state";
import {useRecoilState} from "recoil";

export const GenericGridComponent = ({rowHeight, gridTheme, rowIdArray, columnDefs, gridData}) =>
{
    const gridApiRef = useRef();
    const gridDimensions = useMemo(() => ({ height: '100%', width: '100%' }), []);
    const defaultColDef = useMemo(() => ({resizable: true, filter: true, sortable: true}), []);
    const [, setSelectedGenericGridRow] = useRecoilState(selectedGenericGridRowState);
    const [selectedContextShare, setSelectedContextShare] = useRecoilState(selectedContextShareState);

    const getRowId = useMemo(() => (row) =>
    {
        return getRowIdValue(rowIdArray, row.data);
    }, []);

    const onSelectionChanged = useCallback((params) =>
    {
        const selectedRows = gridApiRef.current.api.getSelectedRows();
        if(selectedRows.length === 1)
            setSelectedGenericGridRow(selectedRows[0]);

        const { colDef, data } = params;

        if (colDef.field === 'stockCode')
            setSelectedContextShare([{ contextShareKey: 'stockCode', contextShareValue: data.stockCode }]);
        else if (colDef.field === 'client')
            setSelectedContextShare([{ contextShareKey: 'client', contextShareValue: data.client }]);
        else
            setSelectedContextShare([{ contextShareKey: 'stockCode', contextShareValue: data.stockCode },
            { contextShareKey: 'client', contextShareValue: data.client }]);

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
                headerHeight={rowHeight}/>
        </div>
    );
};
