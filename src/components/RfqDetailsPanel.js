import React, { useEffect, useRef, useState } from 'react';
import { TextField } from '@mui/material';
import { AgGridReact } from 'ag-grid-react';
import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-alpine.css';
import { GREEKS_COLUMN_DEFS, RFQ_CELL_FLASH_DELAY_MS } from '../calculations/rfqDetailsViewModel';

const useFlashedFieldLabels = (textFields) =>
{
    const [flashedFieldLabels, setFlashedFieldLabels] = useState({});
    const previousValuesRef = useRef({});

    useEffect(() =>
    {
        const previousValues = previousValuesRef.current;
        const changedLabels = [];

        for (const field of textFields)
        {
            const previousValue = previousValues[field.label];
            if (previousValue !== undefined && previousValue !== field.value)
                changedLabels.push(field.label);

            previousValues[field.label] = field.value;
        }

        if (!changedLabels.length)
            return;

        setFlashedFieldLabels(current =>
        {
            const next = { ...current };
            changedLabels.forEach(label => { next[label] = true; });
            return next;
        });

        const timeoutId = setTimeout(() =>
        {
            setFlashedFieldLabels(current =>
            {
                const next = { ...current };
                changedLabels.forEach(label => { delete next[label]; });
                return next;
            });
        }, RFQ_CELL_FLASH_DELAY_MS);

        return () => clearTimeout(timeoutId);
    }, [textFields]);

    return flashedFieldLabels;
};

export const RfqDetailsPanel = ({ gridData, textFields, editable }) =>
{
    const flashedFieldLabels = useFlashedFieldLabels(textFields);

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
                            key={field.label}
                            size="small"
                            label={field.label}
                            value={field.value}
                            className={flashedFieldLabels[field.label] ? 'rfq-details-field-changed' : undefined}
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
                    getRowId={params => params.data.field}
                    suppressRowClickSelection={true}
                    rowSelection="none"
                    headerHeight={22}
                    rowHeight={22}
                    enableCellChangeFlash={true}
                    cellFlashDelay={RFQ_CELL_FLASH_DELAY_MS}
                    suppressColumnVirtualisation={true}
                    suppressRowVirtualisation={true}
                    defaultColDef={{ resizable: false, sortable: true, filter: true }}/>
            </div>
            {createRows()}
        </div>
    );
};
