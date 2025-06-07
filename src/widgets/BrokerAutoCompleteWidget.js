import React from "react";
import '../styles/css/main.css';
import {Autocomplete, TextField} from "@mui/material";

export const BrokerAutoCompleteWidget = ({brokerService, handleInputChange, brokerName, className}) => {
    return (
        <Autocomplete
            className={className}
            size='small'
            renderInput={(params) => (
                <TextField 
                    {...params} 
                    label='Select broker'
                    InputLabelProps={{ style: { fontSize: '0.75rem' } }}
                    inputProps={{ ...params.inputProps, style: { fontSize: '0.75rem' } }}
                />
            )}
            style={{ width: '203px' }}
            label={'Select broker'}
            value={brokerName || null}
            options={(brokerService.getBrokers() || []).map(broker => broker.brokerName)}
            onChange={(_, newValue) => handleInputChange("brokerName", newValue)}
            required
            isOptionEqualToValue={(option, value) => option === value}
            ListboxProps={{ style: { fontSize: '0.75rem' } }}
        />
    );
} 