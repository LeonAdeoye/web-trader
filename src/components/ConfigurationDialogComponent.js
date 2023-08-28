import React, {useEffect, useState} from 'react';
import { Button, Dialog, DialogActions, DialogContent, DialogTitle, TextField, ThemeProvider, Tooltip, Typography } from '@mui/material';
import '../style_sheets/dialog-base.css';
import {configDialogDisplayState} from "../atoms/DialogState";
import {useRecoilState} from "recoil";

const ConfigurationDialogComponent = ({ onCloseHandler }) =>
{
    const [owner, setOwner] = useState('');
    const [key, setKey] = useState('');
    const [value, setValue] = useState('');
    const [configDialogOpenFlag, setConfigDialogOpenFlag ] = useRecoilState(configDialogDisplayState);

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
        setConfigDialogOpenFlag(false);
    };

    const handleCancel = () =>
    {
        onCloseHandler(owner, key, value);
        setConfigDialogOpenFlag(false);
    };

    const cleanUp = () =>
    {
        setOwner('');
        setKey('');
        setValue('');
    };

    useEffect(() =>
    {
        cleanUp();
    }, [configDialogOpenFlag])

    return (
        <Dialog aria-labelledby='dialog-title' open={Boolean(configDialogOpenFlag)} onClose={handleCancel}>
            <DialogTitle id='dialog-title' style={{fontSize: 15, backgroundColor: '#404040', color: 'white', height: '20px'}}>Add New Configuration</DialogTitle>
            <DialogContent>
                <TextField size='small' label='Enter the configuration owner' value={owner} onChange={handleOwnerChange} fullWidth margin='normal' style={{marginTop: '10px', marginBottom: '0px'}} required/>
                <TextField size='small' label='Enter the configuration key' value={key} onChange={handleKeyChange} fullWidth margin='normal' style={{marginTop: '10px', marginBottom: '0px'}} required/>
                <TextField size='small' label='Enter the configuration value' value={value} onChange={handleValueChange} fullWidth margin='normal' style={{marginTop: '10px', marginBottom: '-18px'}} required/>
            </DialogContent>
            <DialogActions style={{height: '35px'}}>
                <Tooltip title={<Typography fontSize={12}>Clear all entered values.</Typography>}>
                    <span>
                        <Button className="dialog-action-button" disabled={!(owner || key || value)} variant='contained' onClick={cleanUp}>Clear</Button>
                    </span>
                </Tooltip>
                <Tooltip title={<Typography fontSize={12}>Cancel adding new configuration and close dialog window.</Typography>}>
                    <span>
                        <Button className="dialog-action-button" color="primary"variant='contained' onClick={handleCancel}>Cancel</Button>
                    </span>
                </Tooltip>
                <Tooltip title={<Typography fontSize={12}>Save the new configuration.</Typography>}>
                    <span>
                        <Button className="dialog-action-button submit" color="primary" disabled={!(owner && key && value)} variant='contained' onClick={handleSubmit}>Submit</Button>
                    </span>
                </Tooltip>
            </DialogActions>
        </Dialog>
    );
};

export default ConfigurationDialogComponent;
