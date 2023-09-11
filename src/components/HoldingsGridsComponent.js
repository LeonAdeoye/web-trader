import React, { useEffect, useMemo} from 'react';
import { AgGridReact } from 'ag-grid-react';
import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-balham.css';
import '../styles/css/main.css';

const HoldingsGridsComponent = ({rows, holdingsProperty, dataId, columnDefs}) =>
{
    const gridDimensions = useMemo(() => ({ height: '100%'}), []);

    useEffect(() =>
    {

    }, [rows]);

    return (
        <div className="holdings">
            <div className="summary-info">
                <span>Holdings of {rows[holdingsProperty]}</span>
            </div>
            <div className="ag-theme-balham" style={gridDimensions}>
                <AgGridReact
                    columnDefs={columnDefs}
                    rowData={rows.holdings}
                    domLayout="autoHeight"
                    headerHeight={25}
                    rowHeight={20}
                />
            </div>
        </div>
    );
};

export default HoldingsGridsComponent;
