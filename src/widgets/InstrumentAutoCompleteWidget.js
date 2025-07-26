import React from "react";
import '../styles/css/main.css';
import {Autocomplete, TextField} from "@mui/material";

export const InstrumentAutoCompleteWidget = ({instruments, handleInputChange, instrumentCode, className, marginTop}) =>
{
    if(marginTop === undefined || marginTop === null)
        marginTop = '0px';
    return (
        <Autocomplete
            className={className}
            size='small'
            sx={{
                '& .MuiInputBase-root': {
                    height: '34px',
                    boxSizing: 'border-box',
                    fontSize: '0.75rem',
                    alignItems: 'center',
                    marginTop: `${marginTop}`
                }
            }}
            renderInput={(params) => (
                <TextField 
                    {...params} 
                    label='Select instrument code'
                    InputLabelProps={{ style: { fontSize: '0.75rem' } }}
                    inputProps={{ ...params.inputProps, style: { fontSize: '0.75rem', padding: '6.5px 14px'} }}
                />
            )}
            style={{ width: '203px'}}
            label={'Select instrument code'}
            value={instrumentCode || null}
            options={(instruments || []).map(inst => inst.instrumentCode)}
            onChange={(_, newValue) => handleInputChange("instrumentCode", newValue)}
            required
            isOptionEqualToValue={(option, value) => option === value}
            ListboxProps={{ style: { fontSize: '0.75rem' } }}
        />
    );
}
