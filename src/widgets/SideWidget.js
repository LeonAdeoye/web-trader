import React from "react";
import '../styles/css/main.css';
import {MenuItem, TextField} from "@mui/material";

export const SideWidget = ({handleSideChange, sideValue, className}) =>
{
    return (
        <TextField
            className={className}
            size='small'
            label='Select side'
            select
            value={sideValue}
            onChange={handleSideChange}
            fullWidth
            style={{ width: '120px', marginTop: '15px'}}>
            <MenuItem value='BUY'>Buy</MenuItem>
            <MenuItem value='SELL'>Sell</MenuItem>
            <MenuItem value='SHORT_SELL'>Short Sell</MenuItem>
        </TextField>
    );
}

