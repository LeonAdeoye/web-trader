import React, {useEffect, useState, useCallback} from 'react';
import { Button, Dialog, DialogActions, DialogContent, DialogTitle, TextField, Tooltip, Typography } from '@mui/material';
import '../styles/css/main.css';
import {configDialogDisplayState} from "../atoms/dialog-state";
import {selectedGenericGridRowState} from "../atoms/component-state";
import {useRecoilState} from "recoil";

const ConfigurationDialogComponent = ({ onCloseHandler }) =>
{
    const [selectedGenericGridRow] = useRecoilState(selectedGenericGridRowState);
    const [configDialogOpenFlag, setConfigDialogOpenFlag ] = useRecoilState(configDialogDisplayState);

    const [owner, setOwner] = useState( '');
    const [key, setKey] = useState( '');
    const [value, setValue] = useState(  '' );
    const [id, setId] = useState(  '' );

    const handleOwnerChange = useCallback((event) =>
    {
        setOwner(event.target.value);
    }, []);

    const handleKeyChange = useCallback((event) =>
    {
        setKey(event.target.value);
    }, []);

    const handleValueChange = useCallback((event) =>
    {
        setValue(event.target.value);
    }, []);

    const handleSubmit = useCallback(() =>
    {
        onCloseHandler(owner, key, value, id);
        setConfigDialogOpenFlag(false);
    }, []);

    const handleCancel = useCallback(() =>
    {
        cleanUp();
        setConfigDialogOpenFlag(false);
    }, []);

    const cleanUp = () =>
    {
        setOwner('');
        setKey('');
        setValue('');
        setId('');
    };

    useEffect(() =>
    {
        if(selectedGenericGridRow !== undefined)
        {
            setOwner(selectedGenericGridRow.owner);
            setKey(selectedGenericGridRow.key);
            setValue(selectedGenericGridRow.value);
            setId(selectedGenericGridRow.id);
        }
        else
            cleanUp();

    }, [configDialogOpenFlag])

    return (
        <Dialog aria-labelledby='dialog-title' open={configDialogOpenFlag} onClose={handleCancel}>
            <DialogTitle id='dialog-title' style={{fontSize: 15, backgroundColor: '#404040', color: 'white', height: '20px'}}>{selectedGenericGridRow !== undefined ? "Update Existing Configuration" : "Add New Configuration"}</DialogTitle>
            <DialogContent>
                <TextField size='small' label='Enter the configuration owner' value={owner} onChange={handleOwnerChange} disabled={selectedGenericGridRow !== undefined} fullWidth margin='normal' style={{marginTop: '10px', marginBottom: '0px'}} required/>
                <TextField size='small' label='Enter the configuration key' value={key} onChange={handleKeyChange} disabled={selectedGenericGridRow !== undefined} fullWidth margin='normal' style={{marginTop: '10px', marginBottom: '0px'}} required/>
                <TextField size='small' label='Enter the configuration value' value={value} onChange={handleValueChange} fullWidth margin='normal' style={{marginTop: '10px', marginBottom: '-18px'}} required/>
            </DialogContent>
            <DialogActions style={{height: '35px'}}>
                <Tooltip title={<Typography fontSize={12}>Clear all entered values.</Typography>}>
                    <span>
                        <Button className="dialog-action-button" disabled={selectedGenericGridRow !== undefined || !(owner || key || value)} variant='contained' onClick={cleanUp}>Clear</Button>
                    </span>
                </Tooltip>
                <Tooltip title={<Typography fontSize={12}>Cancel and close configuration dialog window.</Typography>}>
                    <span>
                        <Button className="dialog-action-button" color="primary"variant='contained' onClick={handleCancel}>Cancel</Button>
                    </span>
                </Tooltip>
                <Tooltip title={<Typography fontSize={12}>Submit the changes.</Typography>}>
                    <span>
                        <Button className="dialog-action-button submit" color="primary" disabled={!(owner && key && value)} variant='contained' onClick={handleSubmit}>Submit</Button>
                    </span>
                </Tooltip>
            </DialogActions>
        </Dialog>
    );
};

export default ConfigurationDialogComponent;
