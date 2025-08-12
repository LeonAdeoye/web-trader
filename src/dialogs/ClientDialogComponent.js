import React, {useState, useCallback, useEffect} from 'react';
import {Grid, TextField } from '@mui/material';

const ClientDialogComponent = ({data, onDataChange}) =>
{
    const [clientData, setClientData] = useState(data || {
        clientId: '',
        clientName: '',
        clientCode: ''
    });
    const [isInitializing, setIsInitializing] = useState(true);

    useEffect(() =>
    {
        if (data && Object.keys(data).length > 0)
            setClientData(data);
        else if (data && Object.keys(data).length === 0)
            setClientData({ clientId: '', clientName: '', clientCode: '' });

        if (isInitializing)
            setIsInitializing(false);

    }, [data,  isInitializing]);

    const handleInputChange = useCallback((field, value) =>
    {
        const newData = { ...clientData, [field]: value };
        setClientData(newData);
        if (onDataChange && !isInitializing)
            onDataChange(newData);

    }, [clientData, onDataChange, isInitializing]);

    return (
        <Grid container direction="column" alignItems="flex-start">
            <Grid item>
                <TextField size="small" label="Client Name" value={clientData.clientName || ''}
                    onChange={(e) => handleInputChange('clientName', e.target.value)}
                    InputProps={{ style: { fontSize: '0.75rem', height: '32px' } }}
                    InputLabelProps={{ style: { fontSize: '0.75rem' } }}
                    style={{ width: '200px' }}/>
            </Grid>
            <Grid item style={{ paddingTop: '10px' }}>
                <TextField size="small" label="Client Code" value={clientData.clientCode || ''}
                    onChange={(e) => handleInputChange('clientCode', e.target.value)}
                    InputProps={{ style: { fontSize: '0.75rem', height: '32px' } }}
                    InputLabelProps={{ style: { fontSize: '0.75rem' } }}
                    style={{ width: '200px' }}/>
            </Grid>
        </Grid>
    );
};

export default ClientDialogComponent;
