import React, {useEffect, useState} from 'react';
import { Button, Dialog, DialogActions, DialogContent, DialogTitle, TextField, ThemeProvider, Tooltip, Typography } from '@mui/material';
import '../style_sheets/dialog-base.css';
import {addConfigDialogDisplayState} from "../atoms/DialogState";
import {useRecoilState} from "recoil";

const AddConfigurationDialogComponent = ({ onCloseHandler }) =>
{
    const [owner, setOwner] = useState('');
    const [key, setKey] = useState('');
    const [value, setValue] = useState('');
    const [addConfigDialogOpenFlag, setAddConfigDialogOpenFlag ] = useRecoilState(addConfigDialogDisplayState);

    const handleOwnerChange = (event) =>
    {
        setOwner(event.target.value);
    };

    const handleKeyChange = (event) =>
    {
        setKey(event.target.value);
    };

    const handleValueChange = (event) =>
    {
        setValue(event.target.value);
    };

    const handleSubmit = () =>
    {
        onCloseHandler(owner, key, value);
        setAddConfigDialogOpenFlag(false);
    };

    const handleCancel = () =>
    {
        handleClear();
        onCloseHandler(owner, key, value);
        setAddConfigDialogOpenFlag(false);
    };

    const handleClear = () =>
    {
        setOwner('');
        setKey('');
        setValue('');
    };

    useEffect(() =>
    {

    }, [addConfigDialogOpenFlag])

    return (
        <Dialog aria-labelledby='dialog-title' open={Boolean(addConfigDialogOpenFlag)} onClose={handleCancel}>
            <DialogTitle id='dialog-title' style={{fontSize: 15, backgroundColor: '#404040', color: 'white', height: '20px'}}>Add New Configuration</DialogTitle>
            <DialogContent>
                <TextField size='small' label='Enter the configuration owner' value={owner} onChange={handleOwnerChange} fullWidth margin='normal' style={{marginTop: '10px', marginBottom: '0px'}} required/>
                <TextField size='small' label='Enter the configuration key' value={key} onChange={handleKeyChange} fullWidth margin='normal' style={{marginTop: '10px', marginBottom: '0px'}} required/>
                <TextField size='small' label='Enter the configuration value' value={value} onChange={handleValueChange} fullWidth margin='normal' style={{marginTop: '10px', marginBottom: '-18px'}} required/>
            </DialogContent>
            <DialogActions style={{height: '35px'}}>
                <Tooltip title={<Typography fontSize={12}>Clear all entered values.</Typography>}>
                    <Button className="dialog-action-button" disabled={!(owner || key || value)} variant='contained' onClick={handleClear}>Clear</Button>
                </Tooltip>
                <Tooltip title={<Typography fontSize={12}>Cancel adding new configuration and close dialog window.</Typography>}>
                    <Button className="dialog-action-button" color="primary"variant='contained' onClick={handleCancel}>Cancel</Button>
                </Tooltip>
                <Tooltip title={<Typography fontSize={12}>Save the new configuration.</Typography>}>
                    <Button className="dialog-action-button submit" color="primary" disabled={!(owner && key && value)} variant='contained' onClick={handleSubmit}>Submit</Button>
                </Tooltip>
            </DialogActions>
        </Dialog>
    );
};

export default AddConfigurationDialogComponent;
