import React from "react";
import '../styles/css/main.css';
import {Autocomplete, TextField} from "@mui/material";

export const ClientAutoCompleteWidget = ({clients, handleInputChange, clientCode, className}) =>
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
                    label='Select Client Code'
                    InputLabelProps={{ style: { fontSize: '0.75rem' } }}
                    inputProps={{ ...params.inputProps, style: { fontSize: '0.75rem', padding: '6.5px 14px' } }}
                />
            )}
            style={{ width: '203px' }}
            label={'Select instrument'}
            value={clientCode || null}
            options={(clients || []).map(client => client.clientCode)}
            onChange={(_, newValue) => handleInputChange("clientCode", newValue)}
            required
            isOptionEqualToValue={(option, value) => option === value}
            ListboxProps={{ style: { fontSize: '0.75rem' } }}
        />
    );
}
