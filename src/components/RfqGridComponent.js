import React, { useRef, useCallback, useEffect, useMemo } from 'react';
import { AgGridReact } from 'ag-grid-react';
import { getRowIdValue } from '../utilities';

export const RfqGridComponent = ({ 
    rowHeight, 
    gridTheme, 
    rowIdArray, 
    columnDefs, 
    gridData, 
    handleAction, 
    sortModel 
}) => {
    const gridRef = useRef();
    const gridApiRef = useRef();

    // Default column definition
    const defaultColDef = useMemo(() => ({
        sortable: true,
        filter: true,
        resizable: true
    }), []);

    // Grid ready event handler
    const onGridReady = useCallback((params) => {
        try {
            gridApiRef.current = params.api;
            
            // Apply column state if sort model is provided
            if (sortModel) {
                params.api.applyColumnState({
                    state: [{ colId: sortModel.colId, sort: sortModel.sort }],
                    defaultState: { sort: null }
                });
            }
        } catch (error) {
            console.warn('Error in onGridReady:', error);
        }
    }, [sortModel]);

    // Cell mouse down event handler
    const onCellMouseDown = useCallback((params) => {
        try {
            if (handleAction && params.event.button === 0) { // Left click only
                handleAction(params.data, params.column.colId);
            }
        } catch (error) {
            console.warn('Error in onCellMouseDown:', error);
        }
    }, [handleAction]);

    // Get row ID function
    const getRowId = useCallback((params) => {
        try {
            return getRowIdValue(params.data, rowIdArray);
        } catch (error) {
            console.warn('Error in getRowId:', error);
            return params.data?.request || 'unknown';
        }
    }, [rowIdArray]);

    return (
        <div className={gridTheme} style={{ height: '100%', width: '100%' }}>
            <AgGridReact
                ref={gridRef}
                rowHeight={rowHeight}
                defaultColDef={defaultColDef}
                columnDefs={columnDefs}
                rowData={gridData}
                onGridReady={onGridReady}
                onCellMouseDown={onCellMouseDown}
                getRowId={getRowId}
                immutableData={false}
                getRowNodeId={getRowId}
            />
        </div>
    );
};
