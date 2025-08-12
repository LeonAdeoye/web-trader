import React, {useState, useCallback, useEffect} from 'react';
import {Grid, TextField} from '@mui/material';

const ExchangeDialogComponent = ({data, onDataChange}) =>
{
    const [exchangeData, setExchangeData] = useState(data || {
        exchangeId: '',
        exchangeName: '',
        exchangeAcronym: ''
    });
    const [isInitializing, setIsInitializing] = useState(true);

    useEffect(() =>
    {
        if (data && Object.keys(data).length > 0)
        {
            setExchangeData(data);
        }
        else if (data && Object.keys(data).length === 0)
        {
            setExchangeData({
                exchangeId: '',
                exchangeName: '',
                exchangeAcronym: ''
            });
        }
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
        <Grid container direction="column" alignItems="flex-start">
            <Grid item>
                <TextField size="small" label="Exchange Name" value={exchangeData.exchangeName || ''}
                    onChange={(e) => handleInputChange('exchangeName', e.target.value)}
                    InputProps={{ style: { fontSize: '0.75rem', height: '32px' } }}
                    InputLabelProps={{ style: { fontSize: '0.75rem' } }}
                    style={{ width: '200px' }}/>
            </Grid>
            <Grid item style={{ paddingTop: '10px' }}>
                <TextField size="small" label="Exchange Acronym" value={exchangeData.exchangeAcronym || ''}
                    onChange={(e) => handleInputChange('exchangeAcronym', e.target.value)}
                    InputProps={{ style: { fontSize: '0.75rem', height: '32px' } }}
                    InputLabelProps={{ style: { fontSize: '0.75rem' } }}
                    style={{ width: '200px' }}/>
            </Grid>
        </Grid>
    );
};

export default ExchangeDialogComponent;
