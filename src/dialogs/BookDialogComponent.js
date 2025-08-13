import React, {useState, useEffect} from 'react';
import {TextField, FormControl, InputLabel, Select, MenuItem, Grid} from '@mui/material';

const BookDialogComponent = ({data, onDataChange, desks = []}) =>
{
    const [bookCode, setBookCode] = useState(data.bookCode || '');
    const [bookName, setBookName] = useState(data.bookName || '');
    const [deskId, setDeskId] = useState(data.deskId || '');

    useEffect(() =>
    {
        const updatedData = {
            bookCode,
            bookName,
            deskId
        };
        onDataChange(updatedData);
    }, [bookCode, bookName, deskId, onDataChange]);

    useEffect(() =>
    {
        if (data.bookCode !== undefined) setBookCode(data.bookCode);
        if (data.bookName !== undefined) setBookName(data.bookName);
        if (data.deskId !== undefined) setDeskId(data.deskId);
    }, [data]);

    const handleBookCodeChange = (event) =>
    {
        setBookCode(event.target.value);
    };

    const handleBookNameChange = (event) =>
    {
        setBookName(event.target.value);
    };

    const handleDeskChange = (event) =>
    {
        setDeskId(event.target.value);
    };

    return (
        <Grid container direction="column" alignItems="flex-start">
            <Grid item>
                <TextField
                    size="small"
                    label="Book Code"
                    value={bookCode}
                    onChange={handleBookCodeChange}
                    InputProps={{ style: { fontSize: '0.75rem', height: '32px' } }}
                    InputLabelProps={{ style: { fontSize: '0.75rem' } }}
                    style={{ width: '200px' }}
                    required
                />
            </Grid>
            <Grid item style={{ paddingTop: '10px' }}>
                <TextField
                    size="small"
                    label="Book Name"
                    value={bookName}
                    onChange={handleBookNameChange}
                    InputProps={{ style: { fontSize: '0.75rem', height: '32px' } }}
                    InputLabelProps={{ style: { fontSize: '0.75rem' } }}
                    style={{ width: '200px' }}
                    required
                />
            </Grid>
            <Grid item style={{ paddingTop: '10px' }}>
                <FormControl size="small" style={{ width: '200px' }}>
                    <InputLabel style={{ fontSize: '0.75rem' }}>Desk</InputLabel>
                    <Select
                        value={deskId}
                        onChange={handleDeskChange}
                        style={{ fontSize: '0.75rem', height: '32px' }}
                        required
                    >
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

export default BookDialogComponent;
