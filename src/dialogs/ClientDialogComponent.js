import React, {useState, useCallback} from 'react';
import {Grid, TextField, FormControlLabel, Checkbox} from '@mui/material';
import {LoggerService} from "../services/LoggerService";

const ClientDialogComponent = ({data, onDataChange}) => {
    const loggerService = new LoggerService(ClientDialogComponent.name);
    
    const [clientData, setClientData] = useState(data || {
        clientId: '',
        clientName: '',
        clientCode: ''
    });

    const handleInputChange = useCallback((field, value) => {
        const newData = { ...clientData, [field]: value };
        setClientData(newData);
        if (onDataChange) {
            onDataChange(newData);
        }
        loggerService.logInfo(`Client dialog - Field ${field} changed to: ${value}`);
    }, [clientData, onDataChange, loggerService]);

    return (
        <Grid container spacing={0.5} direction="column" alignItems="flex-start">
            <Grid item>
                <TextField
                    size="small"
                    label="Client Name"
                    value={clientData.clientName || ''}
                    onChange={(e) => handleInputChange('clientName', e.target.value)}
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
                    label="Client Code"
                    value={clientData.clientCode || ''}
                    onChange={(e) => handleInputChange('clientCode', e.target.value)}
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

export default ClientDialogComponent;
