import * as React from 'react';
import {AgGridReact} from "ag-grid-react";
import {useCallback, useMemo, useRef} from "react";
import {createRowId, getRowIdValue} from "../utilities";
import {selectedContextShareState,selectedGenericGridRowState} from "../atoms/component-state";
import {useRecoilState} from "recoil";

export const GenericGridComponent = ({rowHeight, gridTheme, rowIdArray, columnDefs, gridData, handleAction}) =>
{
    const gridApiRef = useRef();
    const gridDimensions = useMemo(() => ({ height: '100%', width: '100%' }), []);
    const defaultColDef = useMemo(() => ({resizable: true, filter: true, sortable: true}), []);
    const [, setSelectedGenericGridRow] = useRecoilState(selectedGenericGridRowState);
    const [, setSelectedContextShare] = useRecoilState(selectedContextShareState);

    const getRowId = useMemo(() => (row) =>
    {
        return getRowIdValue(rowIdArray, row.data);
    }, []);

    const onCellClicked = useCallback ((params) => {
        const { colDef, data } = params;

        if (colDef.field === 'instrumentCode') {
            setSelectedContextShare([{ contextShareKey: 'instrumentCode', contextShareValue: data.instrumentCode }]);
        } else if (colDef.field === 'clientCode') {
            setSelectedContextShare([{ contextShareKey: 'clientCode', contextShareValue: data.clientCode }]);
        } else {
            setSelectedContextShare([
                { contextShareKey: 'instrumentCode', contextShareValue: data.instrumentCode },
                { contextShareKey: 'clientCode', contextShareValue: data.clientCode }
            ]);
        }
        if(colDef.field !== 'actions')
            setSelectedGenericGridRow(data);
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
                rowData={gridData}
                defaultColDef={defaultColDef}
                enableCellChangeFlash={true}
                rowSelection={'single'}
                onCellClicked={onCellClicked}
                animateRows={true}
                getRowId={getRowId}
                rowHeight={rowHeight}
                context={{handleAction}}
                headerHeight={rowHeight}/>
        </div>
    );
};
