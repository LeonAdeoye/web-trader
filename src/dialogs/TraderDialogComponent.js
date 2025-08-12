import React, {useState, useCallback, useEffect} from 'react';
import {Grid, TextField, FormControl, InputLabel, Select, MenuItem} from '@mui/material';

const TraderDialogComponent = ({data, onDataChange, desks = []}) =>
{
    const [traderData, setTraderData] = useState(data || {
        traderId: '',
        firstName: '',
        lastName: '',
        userId: '',
        deskId: ''
    });
    const [isInitializing, setIsInitializing] = useState(true);

    useEffect(() =>
    {
        if (data && Object.keys(data).length > 0)
            setTraderData(data);
        else if (data && Object.keys(data).length === 0)
            setTraderData({traderId: '', firstName: '', lastName: '', userId: '', deskId: '' });

        if (isInitializing)
            setIsInitializing(false);

    }, [data, isInitializing]);

    const handleInputChange = useCallback((field, value) =>
    {
        const newData = { ...traderData, [field]: value };
        setTraderData(newData);
        if (onDataChange && !isInitializing)
            onDataChange(newData);

    }, [traderData, onDataChange, isInitializing]);

    return (
        <Grid container alignItems="flex-start">
            <Grid item xs={6} style={{ paddingTop: '10px' }}>
                <TextField size="small" label="First Name" value={traderData.firstName || ''}
                    onChange={(e) => handleInputChange('firstName', e.target.value)}
                    InputProps={{ style: { fontSize: '0.75rem', height: '32px' } }}
                    InputLabelProps={{ style: { fontSize: '0.75rem' } }}
                    style={{ width: '200px' }}/>
            </Grid>
            <Grid item xs={6} style={{ paddingTop: '10px' }}>
                <TextField size="small" label="Last Name" value={traderData.lastName || ''}
                    onChange={(e) => handleInputChange('lastName', e.target.value)}
                    InputProps={{ style: { fontSize: '0.75rem', height: '32px' } }}
                    InputLabelProps={{ style: { fontSize: '0.75rem' } }}
                    style={{ width: '200px' }}/>
            </Grid>
            <Grid item xs={6} style={{ paddingTop: '10px' }}>
                <TextField size="small" label="User ID" value={traderData.userId || ''}
                    onChange={(e) => handleInputChange('userId', e.target.value)}
                    InputProps={{ style: { fontSize: '0.75rem', height: '32px' } }}
                    InputLabelProps={{ style: { fontSize: '0.75rem' } }}
                    style={{ width: '200px' }}/>
            </Grid>
            <Grid item xs={6} style={{ paddingTop: '10px' }}>
                <FormControl size="small" style={{ width: '200px' }}>
                    <InputLabel style={{ fontSize: '0.75rem' }}>Desk</InputLabel>
                    <Select
                        value={traderData.deskId || ''}
                        onChange={(e) => handleInputChange('deskId', e.target.value)}
                        style={{ fontSize: '0.75rem', height: '32px' }}>
                        <MenuItem value="">
                            <em>Select a desk</em>
                        </MenuItem>
                        {desks.map((desk) => (
                            <MenuItem key={desk.deskId} value={desk.deskId} style={{ fontSize: '0.75rem' }}>
                                {desk.deskName}
                            </MenuItem>
                        ))}
                    </Select>
                </FormControl>
            </Grid>
        </Grid>
    );
};

export default TraderDialogComponent;
