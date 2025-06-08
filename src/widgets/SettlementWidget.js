import React from "react";
import '../styles/css/main.css';
import {MenuItem, TextField} from "@mui/material";

export const SettlementWidget = ({handleSettlementChange, settlementValue, className}) =>
{
    const settlementOptions = [
        { value: 'T_PLUS_ONE', label: 'T+1' },
        { value: 'T_PLUS_TWO', label: 'T+2' },
        { value: 'T_PLUS_THREE', label: 'T+3' }
    ];

    return (
        <TextField
            className={className}
            size='small'
            label='Settlement Type'
            select
            value={settlementValue}
            onChange={handleSettlementChange}
            fullWidth
            style={{ width: '100px' }}
            InputLabelProps={{ style: { fontSize: '0.75rem' } }}
            SelectProps={{
                style: { fontSize: '0.75rem' }
            }}>
            {settlementOptions.map((option) => (
                <MenuItem key={option.value} value={option.value} style={{ fontSize: '0.75rem' }}>
                    {option.label}
                </MenuItem>
            ))}
        </TextField>
    );
} 
