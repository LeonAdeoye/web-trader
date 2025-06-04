import React from "react";
import '../styles/css/main.css';
import {Autocomplete, TextField} from "@mui/material";

export const ClientAutoCompleteWidget = ({instrumentService, handleInputChange, instrumentCode, className}) =>
{
    return (
        <Autocomplete
            className={className}
            size='small'
            renderInput={(params) => <TextField {...params} label='Select instrument code' />}
            style={{ width: '203px', marginTop: '15px'}}
            value={instrumentCode || null}
            options={(instrumentService.getInstruments() || []).map(instrument => instrumentCode)}
            onChange={(_, newValue) => handleInputChange("instrumentCode", newValue)}
            required
            isOptionEqualToValue={(option, value) => option === value} />
    );
}
