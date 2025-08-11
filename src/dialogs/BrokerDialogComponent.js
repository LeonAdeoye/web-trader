import React, {useState, useCallback} from 'react';
import {Grid, TextField} from '@mui/material';
import {LoggerService} from "../services/LoggerService";

const BrokerDialogComponent = ({data, onDataChange}) => {
    const loggerService = new LoggerService(BrokerDialogComponent.name);
    
    const [brokerData, setBrokerData] = useState(data || {
        brokerId: '',
        brokerAcronym: '',
        brokerDescription: ''
    });

    const handleInputChange = useCallback((field, value) => {
        const newData = { ...brokerData, [field]: value };
        setBrokerData(newData);
        if (onDataChange) {
            onDataChange(newData);
        }
        loggerService.logInfo(`Broker dialog - Field ${field} changed to: ${value}`);
    }, [brokerData, onDataChange, loggerService]);

    return (
        <Grid container spacing={0.5} direction="column" alignItems="flex-start">
            <Grid item>
                <TextField
                    size="small"
                    label="Broker Acronym"
                    value={brokerData.brokerAcronym || ''}
                    onChange={(e) => handleInputChange('brokerAcronym', e.target.value)}
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
                    label="Broker Description"
                    value={brokerData.brokerDescription || ''}
                    onChange={(e) => handleInputChange('brokerDescription', e.target.value)}
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

export default BrokerDialogComponent;
