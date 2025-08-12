import React, {useState, useCallback, useEffect} from 'react';
import {Grid, TextField} from '@mui/material';

const BrokerDialogComponent = ({data, onDataChange}) =>
{
    const [brokerData, setBrokerData] = useState(data || {
        brokerId: '',
        brokerAcronym: '',
        brokerDescription: ''
    });
    const [isInitializing, setIsInitializing] = useState(true);

    useEffect(() =>
    {
        if (data && Object.keys(data).length > 0)
            setBrokerData(data);
        else if (data && Object.keys(data).length === 0)
            setBrokerData({ brokerId: '', brokerAcronym: '', brokerDescription: '' });

        if (isInitializing)
            setIsInitializing(false);

    }, [data, isInitializing]);

    const handleInputChange = useCallback((field, value) =>
    {
        const newData = { ...brokerData, [field]: value };
        setBrokerData(newData);

        if (onDataChange && !isInitializing)
            onDataChange(newData);

    }, [brokerData, onDataChange,  isInitializing]);

    return (
        <Grid container direction="column" alignItems="flex-start">
            <Grid item>
                <TextField size="small" label="Broker Acronym" value={brokerData.brokerAcronym || ''}
                    onChange={(e) => handleInputChange('brokerAcronym', e.target.value)}
                    InputProps={{ style: { fontSize: '0.75rem', height: '32px' } }}
                    InputLabelProps={{ style: { fontSize: '0.75rem' } }}
                    style={{ width: '200px' }} />
            </Grid>
            <Grid item style={{ paddingTop: '10px' }}>
                <TextField size="small" label="Broker Description" value={brokerData.brokerDescription || ''}
                    onChange={(e) => handleInputChange('brokerDescription', e.target.value)}
                    InputProps={{ style: { fontSize: '0.75rem', height: '32px' } }}
                    InputLabelProps={{ style: { fontSize: '0.75rem' } }}
                    style={{ width: '200px' }} />
            </Grid>
        </Grid>
    );
};

export default BrokerDialogComponent;
