import React from 'react';
import { Tooltip } from '@mui/material';

const tooltipStyles = {
    tooltip: { sx: { backgroundColor: '#404040', color: '#ffffff', fontSize: '0.75rem', lineHeight: 1.35, maxWidth: 420, whiteSpace: 'pre-line', padding: '6px 10px', fontWeight: 400, border: '1px solid #6b6b6b', borderRadius: '4px', boxShadow: '0 4px 12px rgba(0, 0, 0, 0.35)' } },
    arrow: { sx: { color: '#404040' } }
};

const CalculationTooltipCellRenderer = (params) =>
{
    const getTooltip = params.getTooltip || params.colDef?.cellRendererParams?.getTooltip;
    const displayValue = params.valueFormatted != null ? params.valueFormatted : params.value ?? '';
    const tooltipText = getTooltip ? getTooltip(params.data) : displayValue;

    return (
        <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', overflow: 'visible' }}>
            <Tooltip title={tooltipText} arrow placement="top" enterDelay={200} componentsProps={tooltipStyles}>
                <span style={{ display: 'block', width: '100%' }}>{displayValue}</span>
            </Tooltip>
        </div>
    );
};

export default CalculationTooltipCellRenderer;
