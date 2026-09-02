import React, {useState, useCallback, useEffect} from 'react';
import {Grid, TextField} from '@mui/material';

const emptyExchange =
{
    exchangeId: '',
    exchangeName: '',
    exchangeAcronym: '',
    timezone: '',
    openTime: '',
    closeTime: '',
    lunchStart: '',
    lunchEnd: '',
    currency: ''
};

const ExchangeDialogComponent = ({data, onDataChange}) =>
{
    const [exchangeData, setExchangeData] = useState(data || emptyExchange);
    const [isInitializing, setIsInitializing] = useState(true);

    useEffect(() =>
    {
        if (data && Object.keys(data).length > 0)
            setExchangeData(data);
        else if (data && Object.keys(data).length === 0)
            setExchangeData(emptyExchange);

        if (isInitializing)
            setIsInitializing(false);
    }, [data, isInitializing]);

    const handleInputChange = useCallback((field, value) =>
    {
        const newData = { ...exchangeData, [field]: value };
        setExchangeData(newData);
        if (onDataChange && !isInitializing)
            onDataChange(newData);
    }, [exchangeData, onDataChange, isInitializing]);

    return (
        <Grid container alignItems="flex-start">
            <Grid item xs={6} style={{ paddingTop: '10px' }}>
                <TextField size="small" label="Exchange Name" value={exchangeData.exchangeName || ''}
                    onChange={(e) => handleInputChange('exchangeName', e.target.value)}
                    InputProps={{ style: { fontSize: '0.75rem', height: '32px' } }}
                    InputLabelProps={{ style: { fontSize: '0.75rem' } }}
                    style={{ width: '200px' }}/>
            </Grid>
            <Grid item xs={6} style={{ paddingTop: '10px' }}>
                <TextField size="small" label="Exchange Acronym" value={exchangeData.exchangeAcronym || ''}
                    onChange={(e) => handleInputChange('exchangeAcronym', e.target.value)}
                    InputProps={{ style: { fontSize: '0.75rem', height: '32px' } }}
                    InputLabelProps={{ style: { fontSize: '0.75rem' } }}
                    style={{ width: '200px' }}/>
            </Grid>
            <Grid item xs={6} style={{ paddingTop: '10px' }}>
                <TextField size="small" label="Timezone" value={exchangeData.timezone || ''}
                    onChange={(e) => handleInputChange('timezone', e.target.value)}
                    placeholder="Asia/Hong_Kong"
                    InputProps={{ style: { fontSize: '0.75rem', height: '32px' } }}
                    InputLabelProps={{ style: { fontSize: '0.75rem' } }}
                    style={{ width: '200px' }}/>
            </Grid>
            <Grid item xs={6} style={{ paddingTop: '10px' }}>
                <TextField size="small" label="Currency" value={exchangeData.currency || ''}
                    onChange={(e) => handleInputChange('currency', e.target.value)}
                    placeholder="HKD"
                    InputProps={{ style: { fontSize: '0.75rem', height: '32px' } }}
                    InputLabelProps={{ style: { fontSize: '0.75rem' } }}
                    style={{ width: '200px' }}/>
            </Grid>
            <Grid item xs={6} style={{ paddingTop: '10px' }}>
                <TextField size="small" label="Open Time" value={exchangeData.openTime || ''}
                    onChange={(e) => handleInputChange('openTime', e.target.value)}
                    placeholder="09:30"
                    InputProps={{ style: { fontSize: '0.75rem', height: '32px' } }}
                    InputLabelProps={{ style: { fontSize: '0.75rem' } }}
                    style={{ width: '200px' }}/>
            </Grid>
            <Grid item xs={6} style={{ paddingTop: '10px' }}>
                <TextField size="small" label="Close Time" value={exchangeData.closeTime || ''}
                    onChange={(e) => handleInputChange('closeTime', e.target.value)}
                    placeholder="16:00"
                    InputProps={{ style: { fontSize: '0.75rem', height: '32px' } }}
                    InputLabelProps={{ style: { fontSize: '0.75rem' } }}
                    style={{ width: '200px' }}/>
            </Grid>
            <Grid item xs={6} style={{ paddingTop: '10px' }}>
                <TextField size="small" label="Lunch Start" value={exchangeData.lunchStart || ''}
                    onChange={(e) => handleInputChange('lunchStart', e.target.value)}
                    placeholder="12:00"
                    InputProps={{ style: { fontSize: '0.75rem', height: '32px' } }}
                    InputLabelProps={{ style: { fontSize: '0.75rem' } }}
                    style={{ width: '200px' }}/>
            </Grid>
            <Grid item xs={6} style={{ paddingTop: '10px' }}>
                <TextField size="small" label="Lunch End" value={exchangeData.lunchEnd || ''}
                    onChange={(e) => handleInputChange('lunchEnd', e.target.value)}
                    placeholder="13:00"
                    InputProps={{ style: { fontSize: '0.75rem', height: '32px' } }}
                    InputLabelProps={{ style: { fontSize: '0.75rem' } }}
                    style={{ width: '200px' }}/>
            </Grid>
        </Grid>
    );
};

export default ExchangeDialogComponent;
