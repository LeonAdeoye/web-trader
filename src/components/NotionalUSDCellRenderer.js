import React from 'react';
import { Tooltip } from '@mui/material';
import { getNotionalUSDTooltip } from '../calculations/rfqTooltipBuilder';

const NotionalUSDCellRenderer = (params) =>
{
    const displayValue = params.valueFormatted != null ? params.valueFormatted : params.value ?? '';
    const tooltipText = getNotionalUSDTooltip(params.data);

    return (
        <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', overflow: 'visible' }}>
            <Tooltip title={tooltipText} arrow placement="top" enterDelay={200} componentsProps={{ tooltip: { sx: { backgroundColor: '#404040', color: '#ffffff', fontSize: '0.95rem', lineHeight: 1.6, maxWidth: 420, whiteSpace: 'pre-line', padding: '10px 14px', fontWeight: 400, border: '1px solid #6b6b6b', borderRadius: '4px', boxShadow: '0 4px 12px rgba(0, 0, 0, 0.35)' } }, arrow: { sx: { color: '#404040' } } }}>
                <span style={{ display: 'block', width: '100%' }}>{displayValue}</span>
            </Tooltip>
        </div>
    );
};

export default NotionalUSDCellRenderer;
