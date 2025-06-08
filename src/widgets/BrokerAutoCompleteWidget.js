import React from "react";
import '../styles/css/main.css';
import {Autocomplete, TextField} from "@mui/material";

export const BrokerAutoCompleteWidget = ({brokers, handleInputChange, brokerAcronym, className}) =>{
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
                    label='Select broker'
                    InputLabelProps={{ style: { fontSize: '0.75rem' } }}
                    inputProps={{ ...params.inputProps, style: { fontSize: '0.75rem', padding: '6.5px 14px' } }}
                />
            )}
            style={{ width: '203px' }}
            label={'Select broker'}
            value={brokerAcronym || null}
            options={(brokers || []).map(broker => broker.brokerAcronym)}
            onChange={(_, newValue) => handleInputChange("brokerAcronym", newValue)}
            required
            isOptionEqualToValue={(option, value) => option === value}
            ListboxProps={{ style: { fontSize: '0.75rem' } }}
        />
    );
} 
