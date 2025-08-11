import React, {useState, useCallback} from 'react';
import {Grid, TextField, FormControlLabel, Checkbox} from '@mui/material';
import {LoggerService} from "../services/LoggerService";

const AccountDialogComponent = ({data, onDataChange}) => {
    const loggerService = new LoggerService(AccountDialogComponent.name);
    
    const [accountData, setAccountData] = useState(data || {
        accountId: '',
        accountName: '',
        accountMnemonic: '',
        legalEntity: '',
        isFirmAccount: false,
        isRiskAccount: false,
        isActive: true,
        customFlags: ''
    });

    const handleInputChange = useCallback((field, value) => {
        const newData = { ...accountData, [field]: value };
        setAccountData(newData);
        if (onDataChange) {
            onDataChange(newData);
        }
        loggerService.logInfo(`Account dialog - Field ${field} changed to: ${value}`);
    }, [accountData, onDataChange, loggerService]);

    const handleCheckboxChange = useCallback((field, checked) => {
        handleInputChange(field, checked);
    }, [handleInputChange]);

    return (
        <Grid container spacing={0.5} alignItems="flex-start">
            <Grid item xs={6}>
                <TextField
                    size="small"
                    label="Account Name"
                    value={accountData.accountName || ''}
                    onChange={(e) => handleInputChange('accountName', e.target.value)}
                    InputProps={{
                        style: { fontSize: '0.75rem', height: '32px' }
                    }}
                    InputLabelProps={{ style: { fontSize: '0.75rem' } }}
                    style={{ width: '200px' }}
                />
            </Grid>
            <Grid item xs={6}>
                <TextField
                    size="small"
                    label="Account Mnemonic"
                    value={accountData.accountMnemonic || ''}
                    onChange={(e) => handleInputChange('accountMnemonic', e.target.value)}
                    InputProps={{
                        style: { fontSize: '0.75rem', height: '32px' }
                    }}
                    InputLabelProps={{ style: { fontSize: '0.75rem' } }}
                    style={{ width: '200px' }}
                />
            </Grid>
            <Grid item xs={6}>
                <TextField
                    size="small"
                    label="Legal Entity"
                    value={accountData.legalEntity || ''}
                    onChange={(e) => handleInputChange('legalEntity', e.target.value)}
                    InputProps={{
                        style: { fontSize: '0.75rem', height: '32px' }
                    }}
                    InputLabelProps={{ style: { fontSize: '0.75rem' } }}
                    style={{ width: '200px' }}
                />
            </Grid>
            <Grid item xs={6}>
                <TextField
                    size="small"
                    label="Custom Flags"
                    value={accountData.customFlags || ''}
                    onChange={(e) => handleInputChange('customFlags', e.target.value)}
                    InputProps={{
                        style: { fontSize: '0.75rem', height: '32px' }
                    }}
                    InputLabelProps={{ style: { fontSize: '0.75rem' } }}
                    style={{ width: '200px' }}
                />
            </Grid>
            <Grid item xs={6}>
                <FormControlLabel
                    control={
                        <Checkbox
                            checked={accountData.isFirmAccount || false}
                            onChange={(e) => handleCheckboxChange('isFirmAccount', e.target.checked)}
                            size="small"
                        />
                    }
                    label="Firm Account"
                    style={{ fontSize: '0.75rem' }}
                />
            </Grid>
            <Grid item xs={6}>
                <FormControlLabel
                    control={
                        <Checkbox
                            checked={accountData.isRiskAccount || false}
                            onChange={(e) => handleCheckboxChange('isRiskAccount', e.target.checked)}
                            size="small"
                        />
                    }
                    label="Risk Account"
                    style={{ fontSize: '0.75rem' }}
                />
            </Grid>
        </Grid>
    );
};

export default AccountDialogComponent;
