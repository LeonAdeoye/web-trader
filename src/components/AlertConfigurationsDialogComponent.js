import {Button, Dialog, DialogActions, DialogContent, DialogTitle, Grid, Tooltip, Typography} from "@mui/material";
import React from "react";
import {useRecoilState} from "recoil";
import {alertConfigurationsDialogDisplayState} from "../atoms/dialog-state";

export const AlertConfigurationsDialogComponent = () =>
{
    const [alertConfigurationsDialogDisplay, setAlertConfigurationsDialogDisplay] = useRecoilState(alertConfigurationsDialogDisplayState);

    const handleCancel = () =>
    {
        setAlertConfigurationsDialogDisplay(false);
    }

    const handleSubmit = () =>
    {
        setAlertConfigurationsDialogDisplay(false);
    }

    const handleClear = () =>
    {

    }

    const canClear = () =>
    {

    }

    const getTitle = () =>
    {

    }

    const canSubmit = () =>
    {

    }

    return (<Dialog aria-labelledby='dialog-title' maxWidth={false} fullWidth={true} open={alertConfigurationsDialogDisplay} onClose={handleCancel} PaperProps={{ style: { width: '870px' } }}>
            <DialogTitle id='dialog-title' style={{fontSize: 15, backgroundColor: '#404040', color: 'white', height: '20px'}}>{getTitle()}</DialogTitle>
            <DialogContent>
                <Grid container spacing={3}>
                    <Grid item xs={6}>
                    </Grid>
                    <Grid item xs={6}>
                    </Grid>
                </Grid>
            </DialogContent>
            <DialogActions style={{height: '35px'}}>
                <Tooltip title={<Typography fontSize={12}>Clear all entered values.</Typography>}>
                    <span>
                        <Button className="dialog-action-button" disabled={!canClear()} variant='contained' onClick={handleClear}>Clear</Button>
                    </span>
                </Tooltip>
                <Tooltip title={<Typography fontSize={12}>Cancel and close configuration dialog window.</Typography>}>
                    <span>
                        <Button className="dialog-action-button" color="primary" variant='contained' onClick={handleCancel}>Cancel</Button>
                    </span>
                </Tooltip>
                <Tooltip title={<Typography fontSize={12}>Submit the changes.</Typography>}>
                    <span>
                        <Button className="dialog-action-button submit" color="primary" disabled={!canSubmit()} variant='contained' onClick={handleSubmit}>Submit</Button>
                    </span>
                </Tooltip>
            </DialogActions>
        </Dialog>);
}
