import React from "react";
import '../styles/css/main.css';
import {MenuItem, TextField} from "@mui/material";

export const IOIQualifierWidget = ({handleSideChange, qualifierValue, className}) =>
{
    return (
        <TextField
            className={className}
            size='small'
            label='Select IOI Qualifier'
            select
            value={qualifierValue}
            onChange={handleSideChange}
            fullWidth
            style={{ width: '160px', marginTop: '15px'}}
            InputLabelProps={{ style: { fontSize: '0.75rem' } }}
            SelectProps={{
                style: { fontSize: '0.75rem' }
            }}>
            <MenuItem value='NONE' style={{ fontSize: '0.75rem' }}>No IOI</MenuItem>
            <MenuItem value='C:1' style={{ fontSize: '0.75rem' }}>Natural Block C:1</MenuItem>
            <MenuItem value='C:2' style={{ fontSize: '0.75rem' }}>Natural Working C:2</MenuItem>
            <MenuItem value='P:1' style={{ fontSize: '0.75rem' }}>Potential P:1</MenuItem>
            <MenuItem value='H:1' style={{ fontSize: '0.75rem' }}>Unwind H:1</MenuItem>
            <MenuItem value='H:2' style={{ fontSize: '0.75rem' }}>Position Wanted H:2</MenuItem>
            <MenuItem value='H:3' style={{ fontSize: '0.75rem' }}>Market Making H:3</MenuItem>
        </TextField>
    );
}

