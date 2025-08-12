import React, {useState, useCallback, useEffect} from 'react';
import {Grid, TextField, FormControlLabel, Checkbox} from '@mui/material';

const AccountDialogComponent = ({data, onDataChange}) =>
{
    const [accountData, setAccountData] = useState(data || {
        accountId: '',
        accountName: '',
        accountMnemonic: '',
        legalEntity: '',
        firmAccount: false,
        riskAccount: false,
        active: true,
        customFlags: ''
    });
    const [isInitializing, setIsInitializing] = useState(true);

    useEffect(() =>
    {
        if (data && Object.keys(data).length > 0)
        {
            setAccountData(data);
        }
        else if (data && Object.keys(data).length === 0)
        {
            setAccountData({
                accountId: '',
                accountName: '',
                accountMnemonic: '',
                legalEntity: '',
                firmAccount: false,
                riskAccount: false,
                active: true,
                customFlags: ''
            });
        }
        if (isInitializing)
            setIsInitializing(false);
    }, [data, isInitializing]);

    const handleInputChange = useCallback((field, value) =>
    {
        const newData = { ...accountData, [field]: value };
        setAccountData(newData);
        if (onDataChange && !isInitializing)
            onDataChange(newData);

    }, [accountData, onDataChange, isInitializing]);

    const handleCheckboxChange = useCallback((field, checked) =>
    {
        handleInputChange(field, checked);
    }, [handleInputChange]);

    return (
        <Grid container alignItems="flex-start">
            <Grid item xs={5} style={{ paddingTop: '10px' }}>
                <TextField size="small" label="Account Name" value={accountData.accountName || ''}
                    onChange={(e) => handleInputChange('accountName', e.target.value)}
                    InputProps={{ style: { fontSize: '0.75rem', height: '32px' } }}
                    InputLabelProps={{ style: { fontSize: '0.75rem' } }}
                    style={{ width: '200px' }}/>
            </Grid>
            <Grid item xs={5} style={{ paddingTop: '10px' }}>
                <TextField  size="small" label="Account Mnemonic" value={accountData.accountMnemonic || ''}
                    onChange={(e) => handleInputChange('accountMnemonic', e.target.value)}
                    InputProps={{ style: { fontSize: '0.75rem', height: '32px' } }}
                    InputLabelProps={{ style: { fontSize: '0.75rem' } }}
                    style={{ width: '200px' }}/>
            </Grid>
            <Grid item xs={5} style={{ paddingTop: '10px' }}>
                <TextField size="small" label="Legal Entity" value={accountData.legalEntity || ''}
                    onChange={(e) => handleInputChange('legalEntity', e.target.value)}
                    InputProps={{ style: { fontSize: '0.75rem', height: '32px' } }}
                    InputLabelProps={{ style: { fontSize: '0.75rem' } }}
                    style={{ width: '200px' }}/>
            </Grid>
            <Grid item xs={5} style={{ paddingTop: '10px' }}>
                <TextField size="small" label="Custom Flags" value={accountData.customFlags || ''}
                    onChange={(e) => handleInputChange('customFlags', e.target.value)}
                    InputProps={{ style: { fontSize: '0.75rem', height: '32px' } }}
                    InputLabelProps={{ style: { fontSize: '0.75rem' } }}
                    style={{ width: '200px' }}/>
            </Grid>
            <Grid item xs={5}>
                <FormControlLabel 
                    label="Firm Account" 
                    sx={{ '& .MuiFormControlLabel-label': { fontSize: '0.7rem' } }}
                    control={ <Checkbox checked={accountData.firmAccount || false} onChange={(e) => handleCheckboxChange('firmAccount', e.target.checked)} size="small"/> }/>
            </Grid>
            <Grid item xs={5}>
                <FormControlLabel 
                    label="Risk Account" 
                    sx={{ '& .MuiFormControlLabel-label': { fontSize: '0.7rem' } }}
                    control={ <Checkbox checked={accountData.riskAccount || false} onChange={(e) => handleCheckboxChange('riskAccount', e.target.checked)} size="small"/> }/>
            </Grid>
        </Grid>
    );
};

export default AccountDialogComponent;
