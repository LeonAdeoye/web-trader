import React from "react";
import '../styles/css/main.css';
import {Autocomplete, TextField} from "@mui/material";

export const TraderIdAutoCompleteWidget = ({traders, handleInputChange, ownerId, className}) =>
{
    return (
        <Autocomplete
            className={className}
            size='small'
            sx={{
                '& .MuiInputBase-root': {
                    height: '32px',
                    boxSizing: 'border-box',
                    fontSize: '0.75rem',
                    alignItems: 'center',
                }
            }}
            renderInput={(params) => (
                <TextField 
                    {...params} 
                    label="Select trader's Id"
                    InputLabelProps={{ style: { fontSize: '0.75rem' } }}
                    inputProps={{ ...params.inputProps, style: { fontSize: '0.75rem', padding: '6.5px 14px' } }}
                />
            )}
            style={{ width: '203px' }}
            label={"Select trader's Id"}
            value={ownerId || null}
            options={(traders || []).map(trader => trader.userId)}
            onChange={(_, newValue) => handleInputChange("ownerId", newValue)}
            required
            isOptionEqualToValue={(option, value) => option === value}
            ListboxProps={{ style: { fontSize: '0.75rem' } }}
        />
    );
}
