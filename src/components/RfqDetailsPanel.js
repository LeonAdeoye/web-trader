import React, { useEffect, useRef, useState } from 'react';
import { FormControl, InputLabel, MenuItem, Select, TextField } from '@mui/material';
import { AgGridReact } from 'ag-grid-react';
import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-alpine.css';
import { GREEKS_COLUMN_DEFS, RFQ_CELL_FLASH_DELAY_MS, toDateInputValue } from '../calculations/rfqDetailsViewModel';

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

const syncValue = (field, editable) =>
    field.type === 'date' && editable && field.editable ? toDateInputValue(field.value) : (field.value ?? '');

const fieldDisplayValue = (field, drafts) =>
{
    if (field.key && drafts[field.key] !== undefined)
        return drafts[field.key];
    return field.value ?? '';
};

export const RfqDetailsPanel = ({ gridData, textFields, editable, dirtyKeys = [], draftEpoch = 0, onFieldChange }) =>
{
    const flashedFieldLabels = useFlashedFieldLabels(textFields);
    const [drafts, setDrafts] = useState({});
    const focusedKeyRef = useRef(null);

    useEffect(() =>
    {
        focusedKeyRef.current = null;
        const next = {};
        for (const field of textFields)
        {
            if (field.key)
                next[field.key] = syncValue(field, editable);
        }
        setDrafts(next);
    }, [draftEpoch]);

    useEffect(() =>
    {
        setDrafts(current =>
        {
            const next = { ...current };
            for (const field of textFields)
            {
                if (field.key && field.key !== focusedKeyRef.current)
                    next[field.key] = syncValue(field, editable);
            }
            return next;
        });
    }, [textFields, editable]);

    const isFieldEditable = (field) => Boolean(editable && field.editable);

    const handleDraftChange = (field, rawValue) =>
    {
        setDrafts(current => ({ ...current, [field.key]: rawValue }));
        if (onFieldChange)
            onFieldChange(field, rawValue);
    };

    const renderField = (field) =>
    {
        const canEdit = isFieldEditable(field);
        const isDirty = canEdit && dirtyKeys.includes(field.key);
        const displayValue = fieldDisplayValue(field, drafts);
        const className = [
            flashedFieldLabels[field.label] ? 'rfq-details-field-changed' : '',
            canEdit ? 'rfq-details-field-editable' : 'rfq-details-field-readonly',
            isDirty ? 'rfq-details-field-dirty' : ''
        ].filter(Boolean).join(' ') || undefined;

        if (canEdit && field.type === 'select')
        {
            return (
                <FormControl key={field.key || field.label} size="small" className={className} style={{ width: '200px' }}>
                    <InputLabel style={{ fontSize: '0.75rem' }}>{field.label}</InputLabel>
                    <Select
                        value={displayValue}
                        label={field.label}
                        onFocus={() => { focusedKeyRef.current = field.key; }}
                        onBlur={() => { focusedKeyRef.current = null; }}
                        onChange={(event) => handleDraftChange(field, event.target.value)}
                        sx={{ fontSize: '0.75rem' }}>
                        {(field.options || []).map(option => (
                            <MenuItem key={String(option)} value={option} style={{ fontSize: '0.75rem' }}>{option}</MenuItem>
                        ))}
                    </Select>
                </FormControl>
            );
        }

        return (
            <TextField
                key={field.key || field.label}
                size="small"
                label={field.label}
                variant="outlined"
                type={canEdit && field.type === 'date' ? 'date' : canEdit && field.type === 'number' ? 'number' : 'text'}
                value={canEdit && field.type === 'date' ? (displayValue || toDateInputValue(field.value)) : displayValue}
                className={className}
                onFocus={() => { if (canEdit) focusedKeyRef.current = field.key; }}
                onChange={canEdit ? (event) => handleDraftChange(field, event.target.value) : undefined}
                onBlur={() => { focusedKeyRef.current = null; }}
                InputProps={{
                    readOnly: !canEdit,
                    style: { fontSize: '0.75rem' }
                }}
                InputLabelProps={{ style: { fontSize: '0.75rem' }, shrink: field.type === 'date' || undefined }}
                style={{ width: '200px' }}/>
        );
    };

    const createRows = () =>
    {
        const rows = [];
        for (let i = 0; i < textFields.length; i += 5)
        {
            const rowFields = textFields.slice(i, i + 5);
            rows.push(
                <div key={i} style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
                    {rowFields.map(field => renderField(field))}
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
