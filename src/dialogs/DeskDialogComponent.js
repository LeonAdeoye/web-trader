import React, {useState, useCallback} from 'react';
import {Grid, TextField} from '@mui/material';
import {LoggerService} from "../services/LoggerService";

const DeskDialogComponent = ({data, onDataChange}) => {
    const loggerService = new LoggerService(DeskDialogComponent.name);
    
    const [deskData, setDeskData] = useState(data || {
        deskId: '',
        deskCode: '',
        deskName: ''
    });

    const handleInputChange = useCallback((field, value) => {
        const newData = { ...deskData, [field]: value };
        setDeskData(newData);
        if (onDataChange) {
            onDataChange(newData);
        }
        loggerService.logInfo(`Desk dialog - Field ${field} changed to: ${value}`);
    }, [deskData, onDataChange, loggerService]);

    return (
        <Grid container spacing={0.5} direction="column" alignItems="flex-start">
            <Grid item>
                <TextField
                    size="small"
                    label="Desk Code"
                    value={deskData.deskCode || ''}
                    onChange={(e) => handleInputChange('deskCode', e.target.value)}
                    InputProps={{
                        style: { fontSize: '0.75rem', height: '32px' }
                    }}
                    InputLabelProps={{ style: { fontSize: '0.75rem' } }}
                    style={{ width: '200px' }}
                />
            </Grid>
            <Grid item>
                <TextField
                    size="small"
                    label="Desk Name"
                    value={deskData.deskName || ''}
                    onChange={(e) => handleInputChange('deskName', e.target.value)}
                    InputProps={{
                        style: { fontSize: '0.75rem', height: '32px' } 
                    }}
                    InputLabelProps={{ style: { fontSize: '0.75rem' } }}
                    style={{ width: '200px' }}
                />
            </Grid>
        </Grid>
    );
};

export default DeskDialogComponent;
