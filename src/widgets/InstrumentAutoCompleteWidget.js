import React from "react";
import '../styles/css/main.css';
import {Autocomplete, TextField} from "@mui/material";

export const InstrumentAutoCompleteWidget = ({instrumentService, handleInputChange, instrumentCode, className}) =>
{
    return (
        <Autocomplete
            className={className}
            size='small'
            renderInput={(params) => (
                <TextField 
                    {...params} 
                    label='Select instrument'
                    InputLabelProps={{ style: { fontSize: '0.75rem' } }}
                    inputProps={{ ...params.inputProps, style: { fontSize: '0.75rem' } }}
                />
            )}
            style={{ width: '203px' }}
            label={'Select instrument'}
            value={instrumentCode || null}
            options={(instrumentService.getInstruments() || []).map(instrument => instrument.instrumentCode)}
            onChange={(_, newValue) => handleInputChange("instrumentCode", newValue)}
            required
            isOptionEqualToValue={(option, value) => option === value}
            ListboxProps={{ style: { fontSize: '0.75rem' } }}
        />
    );
}
