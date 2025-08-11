import React, {useState, useCallback} from 'react';
import {Grid, TextField} from '@mui/material';
import {LoggerService} from "../services/LoggerService";

const InstrumentDialogComponent = ({data, onDataChange}) => {
    const loggerService = new LoggerService(InstrumentDialogComponent.name);
    
    const [instrumentData, setInstrumentData] = useState(data || {
        instrumentId: '',
        instrumentCode: '',
        instrumentDescription: '',
        assetType: '',
        blgCode: '',
        ric: '',
        settlementCurrency: '',
        settlementType: '',
        exchangeAcronym: '',
        lotSize: 0
    });

    const handleInputChange = useCallback((field, value) => {
        const newData = { ...instrumentData, [field]: value };
        setInstrumentData(newData);
        if (onDataChange) {
            onDataChange(newData);
        }
        loggerService.logInfo(`Instrument dialog - Field ${field} changed to: ${value}`);
    }, [instrumentData, onDataChange, loggerService]);

    return (
        <Grid container spacing={0.5} alignItems="flex-start">
            <Grid item xs={6} style={{ paddingRight: '1px' }}>
                <TextField
                    size="small"
                    label="Instrument Code"
                    value={instrumentData.instrumentCode || ''}
                    onChange={(e) => handleInputChange('instrumentCode', e.target.value)}
                    InputProps={{
                        style: { fontSize: '0.75rem', height: '32px' }
                    }}
                    InputLabelProps={{ style: { fontSize: '0.75rem' } }}
                    style={{ width: '200px' }}
                />
            </Grid>
            <Grid item xs={6} style={{ paddingLeft: '1px' }}>
                <TextField
                    size="small"
                    label="Asset Type"
                    value={instrumentData.assetType || ''}
                    onChange={(e) => handleInputChange('assetType', e.target.value)}
                    InputProps={{
                        style: { fontSize: '0.75rem', height: '32px' }
                    }}
                    InputLabelProps={{ style: { fontSize: '0.75rem' } }}
                    style={{ width: '200px' }}
                />
            </Grid>
            <Grid item xs={6} style={{ paddingRight: '1px' }}>
                <TextField
                    size="small"
                    label="Bloomberg Code"
                    value={instrumentData.blgCode || ''}
                    onChange={(e) => handleInputChange('blgCode', e.target.value)}
                    InputProps={{
                        style: { fontSize: '0.75rem', height: '32px' }
                    }}
                    InputLabelProps={{ style: { fontSize: '0.75rem' } }}
                    style={{ width: '200px' }}
                />
            </Grid>
            <Grid item xs={6} style={{ paddingLeft: '1px' }}>
                <TextField
                    size="small"
                    label="RIC"
                    value={instrumentData.ric || ''}
                    onChange={(e) => handleInputChange('ric', e.target.value)}
                    InputProps={{
                        style: { fontSize: '0.75rem', height: '32px' }
                    }}
                    InputLabelProps={{ style: { fontSize: '0.75rem' } }}
                    style={{ width: '200px' }}
                />
            </Grid>
            <Grid item xs={6} style={{ paddingRight: '1px' }}>
                <TextField
                    size="small"
                    label="Settlement Currency"
                    value={instrumentData.settlementCurrency || ''}
                    onChange={(e) => handleInputChange('settlementCurrency', e.target.value)}
                    InputProps={{
                        style: { fontSize: '0.75rem', height: '32px' }
                    }}
                    InputLabelProps={{ style: { fontSize: '0.75rem' } }}
                    style={{ width: '200px' }}
                />
            </Grid>
            <Grid item xs={6} style={{ paddingLeft: '1px' }}>
                <TextField
                    size="small"
                    label="Settlement Type"
                    value={instrumentData.settlementType || ''}
                    onChange={(e) => handleInputChange('settlementType', e.target.value)}
                    InputProps={{
                        style: { fontSize: '0.75rem', height: '32px' }
                    }}
                    InputLabelProps={{ style: { fontSize: '0.75rem' } }}
                    style={{ width: '200px' }}
                />
            </Grid>
            <Grid item xs={6} style={{ paddingRight: '1px' }}>
                <TextField
                    size="small"
                    label="Exchange Acronym"
                    value={instrumentData.exchangeAcronym || ''}
                    onChange={(e) => handleInputChange('exchangeAcronym', e.target.value)}
                    InputProps={{
                        style: { fontSize: '0.75rem', height: '32px' }
                    }}
                    InputLabelProps={{ style: { fontSize: '0.75rem' } }}
                    style={{ width: '200px' }}
                />
            </Grid>
            <Grid item xs={6} style={{ paddingLeft: '1px' }}>
                <TextField
                    size="small"
                    label="Lot Size"
                    type="number"
                    value={instrumentData.lotSize || ''}
                    onChange={(e) => handleInputChange('lotSize', parseInt(e.target.value) || 0)}
                    InputProps={{
                        style: { fontSize: '0.75rem', height: '32px' }
                    }}
                    InputLabelProps={{ style: { fontSize: '0.75rem' } }}
                    style={{ width: '200px' }}
                />
            </Grid>
            <Grid item xs={6} style={{ paddingLeft: '1px' }}>
                <TextField
                    size="small"
                    label="Instrument Description"
                    value={instrumentData.instrumentDescription || ''}
                    onChange={(e) => handleInputChange('instrumentDescription', e.target.value)}
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

export default InstrumentDialogComponent;
