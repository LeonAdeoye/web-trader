import React, {useState, useCallback, useEffect } from 'react';
import {Grid, TextField} from '@mui/material';

const DeskDialogComponent = ({data, onDataChange}) =>
{
    const [deskData, setDeskData] = useState(data || { deskId: '', deskName: '' });
    const [isInitializing, setIsInitializing] = useState(true);

    useEffect(() =>
    {
        if (data && Object.keys(data).length > 0)
        {
            setDeskData(data);
        }
        else if (data && Object.keys(data).length === 0)
        {
            setDeskData({
                deskId: '',
                deskName: ''
            });
        }

        if (isInitializing)
            setIsInitializing(false);

    }, [data, isInitializing]);

    const handleInputChange = useCallback((field, value) =>
    {
        const newData = { ...deskData, [field]: value };
        setDeskData(newData);
        if (onDataChange && !isInitializing)
            onDataChange(newData);

    }, [deskData, onDataChange, isInitializing]);

    return (
        <Grid container direction="column" alignItems="flex-start">
            <Grid item>
                <TextField size="small" label="Desk Name"
                    value={deskData.deskName || ''}
                    onChange={(e) => handleInputChange('deskName', e.target.value)}
                    InputProps={{ style: { fontSize: '0.75rem', height: '32px' } }}
                    InputLabelProps={{ style: { fontSize: '0.75rem' } }}
                    style={{ width: '200px' }}/>
            </Grid>
        </Grid>
    );
};

export default DeskDialogComponent;
