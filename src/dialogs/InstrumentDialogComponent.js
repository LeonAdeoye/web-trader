import React, {useState, useCallback, useEffect, useMemo} from 'react';
import {Grid, MenuItem, TextField} from '@mui/material';
import {assetTypeConverter} from '../utilities';

const SETTLEMENT_TYPES = [
    { value: 'T_PLUS_ZERO', label: 'T+0' },
    { value: 'T_PLUS_ONE', label: 'T+1' },
    { value: 'T_PLUS_TWO', label: 'T+2' },
    { value: 'T_PLUS_THREE', label: 'T+3' }
];

const SETTLEMENT_CURRENCIES = [
    'USD', 'EUR', 'GBP', 'JPY', 'AUD', 'CAD', 'CHF', 'HKD', 'SGD', 'NOK',
    'KRW', 'INR', 'RUB', 'ZAR', 'MXN', 'BRL', 'AED', 'PLN', 'TRY', 'IDR',
    'THB', 'MYR', 'PHP', 'VND', 'ARS', 'CLP', 'COP', 'EGP', 'CNY', 'SEK', 'NZD'
];

const KNOWN_ASSET_TYPES = ['STOCK', 'OPTION', 'FUTURE', 'ETF', 'WARRANT', 'SWAPS'];
const KNOWN_SECTORS = [
    'Consumer Discretionary',
    'Consumer Staples',
    'Energy',
    'Health Care',
    'Information Technology',
    'Logistics',
    'Materials',
    'Software services'
];

const uniqueValues = (items, field) =>
{
    return [...new Set(items.map(item => item[field]).filter(value => value != null && String(value).trim() !== ''))].sort((a, b) => String(a).localeCompare(String(b)));
};

const mergeCurrentValue = (values, current) =>
{
    if (current && !values.includes(current))
        return [...values, current].sort((a, b) => String(a).localeCompare(String(b)));
    return values;
};

const InstrumentDialogComponent = ({data, onDataChange, exchanges = [], instruments = []}) =>
{
    const [instrumentData, setInstrumentData] = useState(data || {
        instrumentId: '',
        instrumentCode: '',
        instrumentDescription: '',
        assetType: '',
        sector: '',
        country: '',
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
                sector: '',
                country: '',
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

    const assetTypes = useMemo(() =>
    {
        const fromInstruments = uniqueValues(instruments, 'assetType');
        const merged = [...new Set([...KNOWN_ASSET_TYPES, ...fromInstruments])].sort((a, b) => String(a).localeCompare(String(b)));
        return mergeCurrentValue(merged, instrumentData.assetType);
    }, [instruments, instrumentData.assetType]);

    const sectors = useMemo(() =>
    {
        const fromInstruments = uniqueValues(instruments, 'sector');
        const merged = [...new Set([...KNOWN_SECTORS, ...fromInstruments])].sort((a, b) => String(a).localeCompare(String(b)));
        return mergeCurrentValue(merged, instrumentData.sector);
    }, [instruments, instrumentData.sector]);

    return (
        <Grid container spacing={0.0} alignItems="flex-start">
            <Grid item xs={5}>
                <TextField size="small" label="Instrument Code" value={instrumentData.instrumentCode || ''}
                    onChange={(e) => handleInputChange('instrumentCode', e.target.value)}
                    InputProps={{ style: { fontSize: '0.75rem', height: '32px' } }}
                    InputLabelProps={{ style: { fontSize: '0.75rem' } }}
                    style={{ width: '200px' }} />
            </Grid>
            <Grid item xs={5}>
                <TextField size="small" label="Asset Type" select value={instrumentData.assetType || ''}
                    onChange={(e) => handleInputChange('assetType', e.target.value)}
                    InputProps={{ style: { fontSize: '0.75rem', height: '32px' } }}
                    InputLabelProps={{ style: { fontSize: '0.75rem' } }}
                    SelectProps={{ style: { fontSize: '0.75rem' } }}
                    style={{ width: '200px' }}>
                    {assetTypes.map(type =>
                        <MenuItem key={type} value={type} style={{ fontSize: '0.75rem' }}>{assetTypeConverter(type)}</MenuItem>
                    )}
                </TextField>
            </Grid>
            <Grid item xs={5} style={{ paddingTop: '10px' }}>
                <TextField size="small" label="Sector" select value={instrumentData.sector || ''}
                    onChange={(e) => handleInputChange('sector', e.target.value)}
                    InputProps={{ style: { fontSize: '0.75rem', height: '32px' } }}
                    InputLabelProps={{ style: { fontSize: '0.75rem' } }}
                    SelectProps={{ style: { fontSize: '0.75rem' } }}
                    style={{ width: '200px' }}>
                    {sectors.map(sector =>
                        <MenuItem key={sector} value={sector} style={{ fontSize: '0.75rem' }}>{sector}</MenuItem>
                    )}
                </TextField>
            </Grid>
            <Grid item xs={5} style={{ paddingTop: '10px' }}>
                <TextField size="small" label="Country" value={instrumentData.country || ''}
                    onChange={(e) => handleInputChange('country', e.target.value)}
                    InputProps={{ style: { fontSize: '0.75rem', height: '32px' } }}
                    InputLabelProps={{ style: { fontSize: '0.75rem' } }}
                    style={{ width: '200px' }} />
            </Grid>
            <Grid item xs={5} style={{ paddingTop: '10px' }}>
                <TextField size="small" label="Bloomberg Code" value={instrumentData.blgCode || ''}
                   onChange={(e) => handleInputChange('blgCode', e.target.value)}
                   InputProps={{ style: { fontSize: '0.75rem', height: '32px' } }}
                   InputLabelProps={{ style: { fontSize: '0.75rem' } }}
                   style={{ width: '200px' }} />
            </Grid>
            <Grid item xs={5} style={{ paddingTop: '10px' }}>
                <TextField size="small" label="RIC" value={instrumentData.ric || ''}
                    onChange={(e) => handleInputChange('ric', e.target.value)}
                    InputProps={{ style: { fontSize: '0.75rem', height: '32px' } }}
                    InputLabelProps={{ style: { fontSize: '0.75rem' } }}
                    style={{ width: '200px' }} />
            </Grid>
            <Grid item xs={5} style={{ paddingTop: '10px' }}>
                <TextField size="small" label="Settlement Currency" select value={instrumentData.settlementCurrency || ''}
                    onChange={(e) => handleInputChange('settlementCurrency', e.target.value)}
                    InputProps={{ style: { fontSize: '0.75rem', height: '32px' } }}
                    InputLabelProps={{ style: { fontSize: '0.75rem' } }}
                    SelectProps={{ style: { fontSize: '0.75rem' } }}
                    style={{ width: '200px' }}>
                    {SETTLEMENT_CURRENCIES.map(currency =>
                        <MenuItem key={currency} value={currency} style={{ fontSize: '0.75rem' }}>{currency}</MenuItem>
                    )}
                </TextField>
            </Grid>
            <Grid item xs={5} style={{ paddingTop: '10px' }}>
                <TextField size="small" label="Settlement Type" select value={instrumentData.settlementType || ''}
                    onChange={(e) => handleInputChange('settlementType', e.target.value)}
                    InputProps={{ style: { fontSize: '0.75rem', height: '32px' } }}
                    InputLabelProps={{ style: { fontSize: '0.75rem' } }}
                    SelectProps={{ style: { fontSize: '0.75rem' } }}
                    style={{ width: '200px' }}>
                    {SETTLEMENT_TYPES.map(option =>
                        <MenuItem key={option.value} value={option.value} style={{ fontSize: '0.75rem' }}>{option.label}</MenuItem>
                    )}
                </TextField>
            </Grid>
            <Grid item xs={5} style={{ paddingTop: '10px' }}>
                <TextField size="small" label="Exchange Acronym" select value={instrumentData.exchangeAcronym || ''}
                    onChange={(e) => handleInputChange('exchangeAcronym', e.target.value)}
                    InputProps={{ style: { fontSize: '0.75rem', height: '32px' } }}
                    InputLabelProps={{ style: { fontSize: '0.75rem' } }}
                    SelectProps={{ style: { fontSize: '0.75rem' } }}
                    style={{ width: '200px' }}>
                    {exchanges.map(exchange =>
                        <MenuItem key={exchange.exchangeId || exchange.exchangeAcronym} value={exchange.exchangeAcronym} style={{ fontSize: '0.75rem' }}>{exchange.exchangeAcronym}</MenuItem>
                    )}
                </TextField>
            </Grid>
            <Grid item xs={5} style={{ paddingTop: '10px' }}>
                <TextField size="small" label="Lot Size" type="number" value={instrumentData.lotSize || ''}
                    onChange={(e) => handleInputChange('lotSize', parseInt(e.target.value) || 0)}
                    InputProps={{ style: { fontSize: '0.75rem', height: '32px' } }}
                    InputLabelProps={{ style: { fontSize: '0.75rem' } }}
                    style={{ width: '200px' }} />
            </Grid>
            <Grid item xs={5} style={{ paddingTop: '10px' }}>
                <TextField size="small" label="Instrument Description" value={instrumentData.instrumentDescription || ''}
                    onChange={(e) => handleInputChange('instrumentDescription', e.target.value)}
                    InputProps={{ style: { fontSize: '0.75rem', height: '32px' } }}
                    InputLabelProps={{ style: { fontSize: '0.75rem' } }}
                    style={{ width: '200px' }} />
            </Grid>
        </Grid>
    );
};

export default InstrumentDialogComponent;
