import React, { useState, useEffect } from 'react';
import { Button, Dialog, DialogActions, DialogContent, DialogTitle, Grid, TextField, FormControl, InputLabel, Select, MenuItem } from '@mui/material';
import { useRecoilState } from 'recoil';
import { bookDialogDisplayState } from '../atoms/dialog-state';
import '../styles/css/book-dialog.css';

const BookDialog = ({ desks = [], onSave, mode = null, editingData = null }) =>
{
    const [bookDialogDisplay, setBookDialogDisplay] = useRecoilState(bookDialogDisplayState);
    const [formData, setFormData] = useState({ bookCode: '', bookName: '', deskId: ''});

    useEffect(() =>
    {
        if (bookDialogDisplay)
        {
            if (mode === 'add')
                setFormData({ bookCode: '', bookName: '', deskId: ''});
            else if (mode === 'update' && editingData)
                setFormData({ bookCode: editingData.bookCode, bookName: editingData.bookName, deskId: editingData.deskId});
            else if (mode === 'clone' && editingData)
                setFormData({ bookCode: editingData.bookCode, bookName: editingData.bookName, deskId: editingData.deskId});
        }
    }, [bookDialogDisplay]);

    const handleInputChange = (field, value) => setFormData(prev => ({ ...prev, [field]: value }));

    const handleSave = async () =>
    {
        if (onSave)
        {
            if (mode === 'update' && editingData)
                await onSave({ ...formData, bookId: editingData.bookId });
            else
                await onSave(formData);
        }
        
        setBookDialogDisplay(false);
    };

    const handleClose = () => setBookDialogDisplay(false);

    const handleClear = () =>
    {
        if (mode === 'update' && editingData)
            setFormData({bookCode: editingData.bookCode || '', bookName: editingData.bookName || '', deskId: editingData.deskId || ''});
        else
            setFormData({ bookCode: '', bookName: '', deskId: ''});
    };

    const canDisable = () => !formData.bookCode || !formData.bookName || !formData.deskId;

    const getDialogTitle = () =>
    {
        if (mode === 'update')
            return 'Book Reference Data Update';
        else if (mode === 'clone')
            return 'Book Reference Data Clone';
        else
            return 'Book Reference Data Add';
    };

    return (
        <Dialog className="book-dialog" open={bookDialogDisplay} PaperProps={{style: {width: '300px',maxWidth: '300px' }}}>
            <DialogTitle  id='book-dialog-title' style={{fontSize: 15, backgroundColor: '#404040', color: 'white', height: '20px'}}>
                {getDialogTitle()}
            </DialogTitle>
            <DialogContent style={{ width: '300px', padding: '20px' }}>
                <Grid container direction="column" alignItems="flex-start" spacing={1}>
                    <Grid item>
                        <TextField  size="small" label="Book Code" value={formData.bookCode || ''}
                            onChange={(e) => handleInputChange('bookCode', e.target.value)}
                            InputProps={{ style: { fontSize: '0.75rem', height: '32px' } }}
                            InputLabelProps={{ style: { fontSize: '0.75rem' } }}
                            style={{ width: '200px' }}/>
                    </Grid>
                    <Grid item style={{ paddingTop: '10px' }}>
                        <TextField  size="small" label="Book Name" value={formData.bookName || ''}
                            onChange={(e) => handleInputChange('bookName', e.target.value)}
                            InputProps={{ style: { fontSize: '0.75rem', height: '32px' } }}
                            InputLabelProps={{ style: { fontSize: '0.75rem' } }}
                            style={{ width: '200px' }}/>
                    </Grid>
                    <Grid item style={{ paddingTop: '10px' }}>
                        <FormControl size="small" style={{ width: '200px' }}>
                            <InputLabel style={{ fontSize: '0.75rem' }}>Desk</InputLabel>
                            <Select value={formData.deskId || ''} onChange={(e) => handleInputChange('deskId', e.target.value)}
                                label="Desk" style={{ height: '32px' }} inputProps={{ style: { fontSize: '0.75rem' } }}>
                                {desks.map((desk) => (
                                    <MenuItem key={desk.deskId} value={desk.deskId} style={{ fontSize: '0.75rem' }}>
                                        {desk.deskName}
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                    </Grid>
                </Grid>
            </DialogContent>
            <DialogActions style={{ height: '40px' }}>
                <Button className="dialog-action-button submit" color="primary" style={{ fontSize: '0.75rem' }} variant='contained' onClick={handleClose}>
                    Cancel
                </Button>
                <Button className="dialog-action-button submit" color="primary" style={{ fontSize: '0.75rem' }} variant='contained' onClick={handleClear}>
                    Clear
                </Button>
                <Button className="dialog-action-button submit" color="primary" style={{ fontSize: '0.75rem' }} variant='contained' disabled={canDisable()} onClick={handleSave}>
                    {mode === 'update' ? 'Update' : 'Save'}
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default BookDialog;
