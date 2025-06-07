import React from "react";
import '../styles/css/main.css';
import {Autocomplete, TextField} from "@mui/material";

export const AccountAutoCompleteWidget = ({accountService, handleInputChange, accountMnemonic, className}) => {
    return (
        <Autocomplete
            className={className}
            size='small'
            renderInput={(params) => (
                <TextField 
                    {...params} 
                    label='Select account'
                    InputLabelProps={{ style: { fontSize: '0.75rem' } }}
                    inputProps={{ ...params.inputProps, style: { fontSize: '0.75rem' } }}
                />
            )}
            style={{ width: '203px' }}
            label={'Select account'}
            value={accountMnemonic || null}
            options={(accountService.getAccounts() || []).map(account => account.accountMnemonic)}
            onChange={(_, newValue) => handleInputChange("accountMnemonic", newValue)}
            required
            isOptionEqualToValue={(option, value) => option === value}
            ListboxProps={{ style: { fontSize: '0.75rem' } }}
        />
    );
} 