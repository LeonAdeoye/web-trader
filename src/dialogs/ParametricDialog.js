import React, {useCallback, useEffect, useState} from 'react';
import {Button, Dialog, DialogActions, DialogContent, DialogTitle, Grid, MenuItem, TextField} from '@mui/material';
import {useRecoilState} from 'recoil';
import {parametricDialogDisplayState} from '../atoms/dialog-state';
import {InstrumentAutoCompleteWidget} from '../widgets/InstrumentAutoCompleteWidget';
import '../styles/css/main.css';

const SETTLEMENT_CURRENCIES = [
    'USD', 'EUR', 'GBP', 'JPY', 'AUD', 'CAD', 'CHF', 'HKD', 'SGD', 'NOK',
    'KRW', 'INR', 'RUB', 'ZAR', 'MXN', 'BRL', 'AED', 'PLN', 'TRY', 'IDR',
    'THB', 'MYR', 'PHP', 'VND', 'ARS', 'CLP', 'COP', 'EGP', 'CNY', 'SEK', 'NZD'
];

const emptyForm = (kind) =>
{
    if (kind === 'rate')
        return { currencyCode: '', interestRatePercentage: '' };
    if (kind === 'price')
        return { instrumentCode: '', closePrice: '', openPrice: '' };
    if (kind === 'adv')
        return { instrumentCode: '', adv: '' };

    return { instrumentCode: '', volatilityPercentage: '' };
};

const ParametricDialog = ({dataName, kind, instruments = [], onSave}) =>
{
    const [dialogState, setDialogState] = useRecoilState(parametricDialogDisplayState);
    const { open, mode, data, kind: dialogKind } = dialogState;
    const [formData, setFormData] = useState(emptyForm(kind));
    const keyLocked = mode === 'update';

    useEffect(() =>
    {
        if (!open)
        {
            setFormData(emptyForm(kind));
            return;
        }

        if (mode === 'add' || !data)
        {
            setFormData(emptyForm(kind));
            return;
        }

        const cloned = { ...data };
        if (mode === 'clone')
        {
            delete cloned.id;
            if (kind === 'rate')
                cloned.currencyCode = '';
            else
                cloned.instrumentCode = '';
        }
        setFormData(cloned);
    }, [open, mode, data, kind]);

    const handleInputChange = useCallback((field, value) =>
    {
        setFormData(prev => ({ ...prev, [field]: value }));
    }, []);

    const handleClose = useCallback(() =>
    {
        setDialogState({ open: false, mode: 'add', data: null, kind: null });
        setFormData(emptyForm(kind));
    }, [kind, setDialogState]);

    const handleClear = useCallback(() =>
    {
        if (mode === 'update' && data)
            setFormData({ ...data });
        else if (mode === 'clone' && data)
        {
            const cloned = { ...data };
            delete cloned.id;
            if (kind === 'rate')
                cloned.currencyCode = '';
            else
                cloned.instrumentCode = '';
            setFormData(cloned);
        }
        else
            setFormData(emptyForm(kind));
    }, [kind, mode, data]);

    const canDisable = useCallback(() =>
    {
        if (kind === 'rate')
            return !formData.currencyCode || formData.interestRatePercentage === '' || formData.interestRatePercentage == null;
        if (kind === 'price')
            return !formData.instrumentCode || formData.closePrice === '' || formData.closePrice == null || formData.openPrice === '' || formData.openPrice == null;
        if (kind === 'adv')
            return !formData.instrumentCode || formData.adv === '' || formData.adv == null;

        return !formData.instrumentCode || formData.volatilityPercentage === '' || formData.volatilityPercentage == null;
    }, [kind, formData]);

    const handleSave = useCallback(async () =>
    {
        if (onSave)
            await onSave(formData, mode);

        handleClose();
    }, [formData, mode, onSave, handleClose]);

    const fieldStyle = { width: '200px' };
    const inputProps = { style: { fontSize: '0.75rem', height: '32px' } };
    const labelProps = { style: { fontSize: '0.75rem' } };

    const renderFields = () =>
    {
        const leftItem = { paddingRight: '20px' };

        if (kind === 'rate')
            return (
                <Grid container spacing={0.0} alignItems="flex-start">
                    <Grid item xs={6} style={leftItem}>
                        <TextField size="small" label="Currency" select value={formData.currencyCode || ''} disabled={keyLocked}
                            onChange={(e) => handleInputChange('currencyCode', e.target.value)}
                            InputProps={inputProps} InputLabelProps={labelProps} SelectProps={{ style: { fontSize: '0.75rem' } }} style={fieldStyle}>
                            {SETTLEMENT_CURRENCIES.map(currency =>
                                <MenuItem key={currency} value={currency} style={{ fontSize: '0.75rem' }}>{currency}</MenuItem>
                            )}
                        </TextField>
                    </Grid>
                    <Grid item xs={6}>
                        <TextField size="small" label="Interest Rate %" type="number" value={formData.interestRatePercentage ?? ''}
                            onChange={(e) => handleInputChange('interestRatePercentage', e.target.value)}
                            InputProps={inputProps} InputLabelProps={labelProps} style={fieldStyle} />
                    </Grid>
                </Grid>
            );

        if (kind === 'price')
            return (
                <Grid container spacing={0.0} alignItems="flex-start">
                    <Grid item xs={6} style={leftItem}>
                        <InstrumentAutoCompleteWidget instruments={instruments} instrumentCode={formData.instrumentCode || ''}
                            handleInputChange={handleInputChange} disabled={keyLocked} />
                    </Grid>
                    <Grid item xs={6}>
                        <TextField size="small" label="Close Price" type="number" value={formData.closePrice ?? ''}
                            onChange={(e) => handleInputChange('closePrice', e.target.value)}
                            InputProps={inputProps} InputLabelProps={labelProps} style={fieldStyle} />
                    </Grid>
                    <Grid item xs={6} style={{ paddingTop: '10px', ...leftItem }}>
                        <TextField size="small" label="Open Price" type="number" value={formData.openPrice ?? ''}
                            onChange={(e) => handleInputChange('openPrice', e.target.value)}
                            InputProps={inputProps} InputLabelProps={labelProps} style={fieldStyle} />
                    </Grid>
                </Grid>
            );

        if (kind === 'adv')
            return (
                <Grid container spacing={0.0} alignItems="flex-start">
                    <Grid item xs={6} style={leftItem}>
                        <InstrumentAutoCompleteWidget instruments={instruments} instrumentCode={formData.instrumentCode || ''}
                            handleInputChange={handleInputChange} disabled={keyLocked} />
                    </Grid>
                    <Grid item xs={6}>
                        <TextField size="small" label="ADV" type="number" value={formData.adv ?? ''}
                            onChange={(e) => handleInputChange('adv', e.target.value)}
                            InputProps={inputProps} InputLabelProps={labelProps} style={fieldStyle} />
                    </Grid>
                </Grid>
            );

        return (
            <Grid container spacing={0.0} alignItems="flex-start">
                <Grid item xs={6} style={leftItem}>
                    <InstrumentAutoCompleteWidget instruments={instruments} instrumentCode={formData.instrumentCode || ''}
                        handleInputChange={handleInputChange} disabled={keyLocked} />
                </Grid>
                <Grid item xs={6}>
                    <TextField size="small" label="Volatility %" type="number" value={formData.volatilityPercentage ?? ''}
                        onChange={(e) => handleInputChange('volatilityPercentage', e.target.value)}
                        InputProps={inputProps} InputLabelProps={labelProps} style={fieldStyle} />
                </Grid>
            </Grid>
        );
    };

    return (
        <Dialog aria-labelledby='dialog-title' open={open && dialogKind === kind}>
            <DialogTitle id='dialog-title' style={{fontSize: 15, backgroundColor: '#404040', color: 'white', height: '20px'}}>
                {`${dataName} ${mode === 'add' ? 'Add' : mode === 'update' ? 'Update' : 'Clone'}`}
            </DialogTitle>
            <DialogContent style={{width: '550px', padding: '20px'}}>
                {renderFields()}
            </DialogContent>
            <DialogActions style={{height: '40px'}}>
                <Button className="dialog-action-button submit" color="primary" style={{ marginRight: '0px', marginLeft: '0px', fontSize: '0.75rem'}} variant='contained' onClick={handleClose}>Cancel</Button>
                <Button className="dialog-action-button submit" color="primary" style={{ marginRight: '0px', marginLeft: '10px', fontSize: '0.75rem'}} variant='contained' disabled={canDisable()} onClick={handleClear}>Clear</Button>
                <Button className="dialog-action-button submit" color="primary" style={{ marginRight: '0px', marginLeft: '10px', fontSize: '0.75rem'}} variant='contained' disabled={canDisable()} onClick={handleSave}>
                    {mode === 'add' ? 'Add' : mode === 'update' ? 'Update' : 'Save'}
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default ParametricDialog;
