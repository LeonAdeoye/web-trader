import React from 'react';
import { TextField } from '@mui/material';
import { AgGridReact } from 'ag-grid-react';
import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-alpine.css';
import { GREEKS_COLUMN_DEFS } from '../calculations/rfqDetailsViewModel';

export const RfqDetailsPanel = ({ gridData, textFields, editable }) =>
{
    const createRows = () =>
    {
        const rows = [];
        for (let i = 0; i < textFields.length; i += 5)
        {
            const rowFields = textFields.slice(i, i + 5);
            rows.push(
                <div key={i} style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
                    {rowFields.map((field, fieldIndex) => (
                        <TextField
                            key={fieldIndex}
                            size="small"
                            label={field.label}
                            value={field.value}
                            InputProps={{
                                readOnly: !editable,
                                style: { fontSize: '0.75rem' }
                            }}
                            InputLabelProps={{ style: { fontSize: '0.75rem' } }}
                            style={{ width: '200px' }}/>
                    ))}
                </div>
            );
        }
        return rows;
    };

    return (
        <div style={{ padding: '10px' }}>
            <div className="ag-theme-alpine" style={{ height: '120px', width: '720px', marginBottom: '20px' }}>
                <AgGridReact
                    rowData={gridData}
                    columnDefs={GREEKS_COLUMN_DEFS}
                    suppressRowClickSelection={true}
                    rowSelection="none"
                    headerHeight={22}
                    rowHeight={22}
                    suppressColumnVirtualisation={true}
                    suppressRowVirtualisation={true}
                    defaultColDef={{ resizable: false, sortable: true, filter: true }}/>
            </div>
            {createRows()}
        </div>
    );
};
