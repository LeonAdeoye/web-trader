import React, {useState, useCallback, useEffect, useRef} from 'react';
import {Button, Dialog, DialogActions, DialogContent, DialogTitle, Grid} from '@mui/material';
import '../styles/css/main.css';
import {useRecoilState} from "recoil";
import {LoggerService} from "../services/LoggerService";
import {referenceDataDialogDisplayState} from "../atoms/dialog-state";

const ReferenceDataDialog = ({dataName}) =>
{
    const [referenceDataDialogDisplay, setReferenceDataDialogDisplay] = useRecoilState(referenceDataDialogDisplayState);
    const loggerService = useRef(new LoggerService(ReferenceDataDialog.name)).current;

    const handleInputChange = useCallback((field, value) =>
    {
        switch (field)
        {
            default:
                loggerService.logError(`Trade History Search Dialog - Unknown field: ${field}`);
        }
    }, [loggerService]);

    const handleAdd = useCallback(() =>
    {
        // TODO
    }, []);

    useEffect(() =>
    {
        const loadData = async () =>
        {
            // TODO
        };
        loadData().then(() => loggerService.logInfo("referenceDataDialog's data loaded successfully."))
    }, []);

    const handleCancel = useCallback(() =>
    {
        // TODO
        setReferenceDataDialogDisplay(false);
    }, []);

    const handleClear = useCallback(() =>
    {
        // TODO
    }, []);

    const canDisable = useCallback(() =>
    {
        return false; // TODO
    }, [])

    return (
        <Dialog aria-labelledby='dialog-title' open={referenceDataDialogDisplay}>
            <DialogTitle id='dialog-title' style={{fontSize: 15, backgroundColor: '#404040', color: 'white', height: '20px'}}>{`${dataName} Reference Data Maintenance`}</DialogTitle>
            <DialogContent style={{width: '300px'}}>
                <Grid container spacing={0.5} direction="column" alignItems="flex-start">
                    <Grid item style={{marginLeft: '-15px', marginTop: '10px', marginBottom: '5px' }}>
                        {/*TODO*/}
                    </Grid>
                    <Grid item style={{marginLeft: '-15px', marginBottom: '5px' }}>
                        {/*TODO*/}
                    </Grid>
                    <Grid item style={{marginLeft: '-15px', marginBottom: '0px' }}>
                        {/*TODO*/}
                    </Grid>
                </Grid>
            </DialogContent>
            <DialogActions style={{height: '40px'}}>
                <Button className="dialog-action-button submit" color="primary" style={{ marginRight: '0px', marginLeft: '0px', fontSize: '0.75rem'}} variant='contained' disabled={false} onClick={handleCancel}>Cancel</Button>
                <Button className="dialog-action-button submit" color="primary" style={{ marginRight: '0px', marginLeft: '10px', fontSize: '0.75rem'}} variant='contained' disabled={canDisable()} onClick={handleClear}>Clear</Button>
                <Button className="dialog-action-button submit" color="primary" style={{ marginRight: '0px', marginLeft: '10px', fontSize: '0.75rem'}} variant='contained' disabled={canDisable()} onClick={handleAdd}>Add</Button>
            </DialogActions>
        </Dialog>);
};

export default ReferenceDataDialog;

