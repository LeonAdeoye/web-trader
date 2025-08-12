import React, {useState, useCallback, useEffect} from 'react';
import {Grid, TextField} from '@mui/material';

const InstrumentDialogComponent = ({data, onDataChange}) =>
{
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
    const [isInitializing, setIsInitializing] = useState(true);

    useEffect(() =>
    {
        if (data && Object.keys(data).length > 0)
        {
            setInstrumentData(data);
        }
        else if (data && Object.keys(data).length === 0)
        {
            setInstrumentData({
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
        }

        if (isInitializing)
            setIsInitializing(false);

    }, [data, isInitializing]);

    const handleInputChange = useCallback((field, value) =>
    {
        const newData = { ...instrumentData, [field]: value };
        setInstrumentData(newData);
        if (onDataChange && !isInitializing)
            onDataChange(newData);

    }, [instrumentData, onDataChange, isInitializing]);

    return (
        <Grid container spacing={0.0} alignItems="flex-start">
            <Grid item xs={5}>
                <TextField size="small" label="Instrument Code" value={instrumentData.instrumentCode || ''}
                    onChange={(e) => handleInputChange('instrumentCode', e.target.value)}
                    InputProps={{ style: { fontSize: '0.75rem', height: '32px' } }}
                    InputLabelProps={{ style: { fontSize: '0.75rem' } }}
                    style={{ width: '200px' }}/>
            </Grid>
            <Grid item xs={5}>
                <TextField size="small" label="Asset Type" value={instrumentData.assetType || ''}
                    onChange={(e) => handleInputChange('assetType', e.target.value)}
                    InputProps={{ style: { fontSize: '0.75rem', height: '32px' } }}
                    InputLabelProps={{ style: { fontSize: '0.75rem' } }}
                    style={{ width: '200px' }}/>
            </Grid>
            <Grid item xs={5} style={{ paddingTop: '10px' }}>
                <TextField size="small" label="Bloomberg Code" value={instrumentData.blgCode || ''}
                   onChange={(e) => handleInputChange('blgCode', e.target.value)}
                   InputProps={{ style: { fontSize: '0.75rem', height: '32px' } }}
                   InputLabelProps={{ style: { fontSize: '0.75rem' } }}
                   style={{ width: '200px' }}/>
            </Grid>
            <Grid item xs={5} style={{ paddingTop: '10px' }}>
                <TextField size="small" label="RIC" value={instrumentData.ric || ''}
                    onChange={(e) => handleInputChange('ric', e.target.value)}
                    InputProps={{ style: { fontSize: '0.75rem', height: '32px' } }}
                    InputLabelProps={{ style: { fontSize: '0.75rem' } }}
                    style={{ width: '200px' }}/>
            </Grid>
            <Grid item xs={5} style={{ paddingTop: '10px' }}>
                <TextField size="small" label="Settlement Currency" value={instrumentData.settlementCurrency || ''}
                    onChange={(e) => handleInputChange('settlementCurrency', e.target.value)}
                    InputProps={{ style: { fontSize: '0.75rem', height: '32px' } }}
                    InputLabelProps={{ style: { fontSize: '0.75rem' } }}
                    style={{ width: '200px' }}/>
            </Grid>
            <Grid item xs={5} style={{ paddingTop: '10px' }}>
                <TextField size="small" label="Settlement Type" value={instrumentData.settlementType || ''}
                    onChange={(e) => handleInputChange('settlementType', e.target.value)}
                    InputProps={{ style: { fontSize: '0.75rem', height: '32px' } }}
                    InputLabelProps={{ style: { fontSize: '0.75rem' } }}
                    style={{ width: '200px' }}/>
            </Grid>
            <Grid item xs={5} style={{ paddingTop: '10px' }}>
                <TextField size="small" label="Exchange Acronym" value={instrumentData.exchangeAcronym || ''}
                    onChange={(e) => handleInputChange('exchangeAcronym', e.target.value)}
                    InputProps={{ style: { fontSize: '0.75rem', height: '32px' } }}
                    InputLabelProps={{ style: { fontSize: '0.75rem' } }}
                    style={{ width: '200px' }}/>
            </Grid>
            <Grid item xs={5} style={{ paddingTop: '10px' }}>
                <TextField size="small" label="Lot Size" type="number" value={instrumentData.lotSize || ''}
                    onChange={(e) => handleInputChange('lotSize', parseInt(e.target.value) || 0)}
                    InputProps={{ style: { fontSize: '0.75rem', height: '32px' } }}
                    InputLabelProps={{ style: { fontSize: '0.75rem' } }}
                    style={{ width: '200px' }}/>
            </Grid>
            <Grid item xs={5} style={{ paddingTop: '10px' }}>
                <TextField size="small" label="Instrument Description" value={instrumentData.instrumentDescription || ''}
                    onChange={(e) => handleInputChange('instrumentDescription', e.target.value)}
                    InputProps={{ style: { fontSize: '0.75rem', height: '32px' } }}
                    InputLabelProps={{ style: { fontSize: '0.75rem' } }}
                    style={{ width: '200px' }}/>
            </Grid>
        </Grid>
    );
};

export default InstrumentDialogComponent;
