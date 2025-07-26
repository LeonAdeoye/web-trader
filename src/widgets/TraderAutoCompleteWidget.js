import React from "react";
import '../styles/css/main.css';
import {Autocomplete, TextField} from "@mui/material";

export const TraderAutoCompleteWidget = ({traders, handleInputChange, userId, className}) =>
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
                    label="Select trader's user Id"
                    InputLabelProps={{ style: { fontSize: '0.75rem' } }}
                    inputProps={{ ...params.inputProps, style: { fontSize: '0.75rem', padding: '6.5px 14px' } }}
                />
            )}
            style={{ width: '203px' }}
            label={"Select trader's user Id"}
            value={userId || null}
            options={(traders || []).map(trader => trader.userId)}
            onChange={(_, newValue) => handleInputChange("userId", newValue)}
            required
            isOptionEqualToValue={(option, value) => option === value}
            ListboxProps={{ style: { fontSize: '0.75rem' } }}
        />
    );
}
