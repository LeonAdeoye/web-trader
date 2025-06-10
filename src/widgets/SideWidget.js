import React from "react";
import '../styles/css/main.css';
import {MenuItem, TextField} from "@mui/material";

export const SideWidget = ({handleSideChange, sideValue, className}) =>
{
    return (
        <TextField
            className={className}
            size='small'
            label='Select Side'
            select
            value={sideValue}
            onChange={handleSideChange}
            fullWidth
            style={{ width: '120px', marginTop: '15px'}}
            InputLabelProps={{ style: { fontSize: '0.75rem' } }}
            SelectProps={{
                style: { fontSize: '0.75rem' }
            }}>
            <MenuItem value='BUY' style={{ fontSize: '0.75rem' }}>Buy</MenuItem>
            <MenuItem value='SELL' style={{ fontSize: '0.75rem' }}>Sell</MenuItem>
            <MenuItem value='SHORT_SELL' style={{ fontSize: '0.75rem' }}>Short Sell</MenuItem>
            <MenuItem value='SHORT_SELL_EXEMPT' style={{ fontSize: '0.75rem' }}>SS Exempt</MenuItem>
        </TextField>
    );
}

