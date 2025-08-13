import React, {useState, useEffect} from 'react';
import {Grid, TextField, FormControl, InputLabel, Select, MenuItem} from '@mui/material';

const BankHolidayDialogComponent = ({data, onDataChange}) =>
{
    const [bankHolidayData, setBankHolidayData] = useState(data || {
        id: '',
        countryCode: '',
        holidayName: '',
        holidayDate: '',
        isPublicHoliday: true,
        description: ''
    });

    useEffect(() =>
    {
        if (data && Object.keys(data).length > 0)
            setBankHolidayData(data);
        else if (data && Object.keys(data).length === 0)
            setBankHolidayData({
                id: '',
                countryCode: '',
                holidayName: '',
                holidayDate: '',
                isPublicHoliday: true,
                description: ''
            });
    }, [data]);

    const handleInputChange = (field, value) =>
    {
        const newData = { ...bankHolidayData, [field]: value };
        setBankHolidayData(newData);
        if (onDataChange)
            onDataChange(newData);
    };

    const countries = [
        {code: 'JP', name: 'Japan'},
        {code: 'HK', name: 'Hong Kong'}
    ];

    return (
        <Grid container spacing={2} direction="column">
            <Grid item>
                <FormControl fullWidth size="small">
                    <InputLabel>Country</InputLabel>
                    <Select
                        value={bankHolidayData.countryCode || ''}
                        onChange={(e) => handleInputChange('countryCode', e.target.value)}
                        label="Country">
                        {countries.map(country =>
                            <MenuItem key={country.code} value={country.code}>
                                {country.name}
                            </MenuItem>
                        )}
                    </Select>
                </FormControl>
            </Grid>
            <Grid item>
                <TextField
                    fullWidth
                    size="small"
                    label="Holiday Name"
                    value={bankHolidayData.holidayName || ''}
                    onChange={(e) => handleInputChange('holidayName', e.target.value)}
                    InputProps={{ style: { fontSize: '0.75rem', height: '32px' } }}
                    InputLabelProps={{ style: { fontSize: '0.75rem' } }}/>
            </Grid>
            <Grid item>
                <TextField
                    fullWidth
                    size="small"
                    label="Holiday Date (YYYY-MM-DD)"
                    value={bankHolidayData.holidayDate || ''}
                    onChange={(e) => handleInputChange('holidayDate', e.target.value)}
                    placeholder="2024-12-25"
                    InputProps={{ style: { fontSize: '0.75rem', height: '32px' } }}
                    InputLabelProps={{ style: { fontSize: '0.75rem' } }}/>
            </Grid>
            <Grid item>
                <TextField
                    fullWidth
                    size="small"
                    label="Description"
                    value={bankHolidayData.description || ''}
                    onChange={(e) => handleInputChange('description', e.target.value)}
                    multiline
                    rows={2}
                    InputProps={{ style: { fontSize: '0.75rem' } }}
                    InputLabelProps={{ style: { fontSize: '0.75rem' } }}/>
            </Grid>
        </Grid>
    );
};

export default BankHolidayDialogComponent;
