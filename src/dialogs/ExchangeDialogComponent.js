import React, {useState, useCallback} from 'react';
import {Grid, TextField} from '@mui/material';
import {LoggerService} from "../services/LoggerService";

const ExchangeDialogComponent = ({data, onDataChange}) => {
    const loggerService = new LoggerService(ExchangeDialogComponent.name);
    
    const [exchangeData, setExchangeData] = useState(data || {
        exchangeId: '',
        exchangeName: '',
        exchangeAcronym: ''
    });

    const handleInputChange = useCallback((field, value) => {
        const newData = { ...exchangeData, [field]: value };
        setExchangeData(newData);
        if (onDataChange) {
            onDataChange(newData);
        }
        loggerService.logInfo(`Exchange dialog - Field ${field} changed to: ${value}`);
    }, [exchangeData, onDataChange, loggerService]);

    return (
        <Grid container spacing={0.5} direction="column" alignItems="flex-start">
            <Grid item>
                <TextField
                    size="small"
                    label="Exchange Name"
                    value={exchangeData.exchangeName || ''}
                    onChange={(e) => handleInputChange('exchangeName', e.target.value)}
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
                    label="Exchange Acronym"
                    value={exchangeData.exchangeAcronym || ''}
                    onChange={(e) => handleInputChange('exchangeAcronym', e.target.value)}
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

export default ExchangeDialogComponent;
