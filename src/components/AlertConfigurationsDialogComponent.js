import {Autocomplete,Button, Dialog,DialogActions, DialogContent, DialogTitle, Grid, TextField, Tooltip, Typography} from "@mui/material";
import React, {useCallback, useState} from "react";
import {useRecoilState} from "recoil";
import {alertConfigurationsDialogDisplayState} from "../atoms/dialog-state";
import {selectedGenericGridRowState} from "../atoms/component-state";

export const AlertConfigurationsDialogComponent = ({ onCloseHandler , clientService }) =>
{
    const defaultAlertConfiguration =
        {
            alertConfigurationId: "",
            alertName: "",
            type: "",
            frequency: "",
            clientId: "",
            desk: "",
            side: "",
            exchanges: "",
            customizations: "",
            isActive: "",
        }

    const [selectedGenericGridRow] = useRecoilState(selectedGenericGridRowState);
    const [alertConfigurationsDialogDisplay, setAlertConfigurationsDialogDisplay] = useRecoilState(alertConfigurationsDialogDisplayState);
    const [alertConfiguration, setAlertConfiguration] = useState(defaultAlertConfiguration);


    const handleCancel = () =>
    {
        setAlertConfigurationsDialogDisplay(false);
    }

    const handleSubmit = () =>
    {
        setAlertConfigurationsDialogDisplay(false);
        onCloseHandler(alertConfiguration);
    }

    const handleClear = () =>
    {

    }

    const canClear = () =>
    {

    }

    const getTitle = () =>
    {
        if(!selectedGenericGridRow)
            return "Add New Alert Configuration";

        if(selectedGenericGridRow?.alertConfigurationId)
            return "Update Existing Alert Configuration";

        return "Clone Existing Alert Configuration";
    }

    const canSubmit = () =>
    {

    }

    const handleInputChange = useCallback((name, value) =>
    {
        setAlertConfiguration(prevData => ({ ...prevData, [name]: value }));
    }, []);

    return (<Dialog aria-labelledby='dialog-title' maxWidth={false} fullWidth={true} open={alertConfigurationsDialogDisplay} onClose={handleCancel} PaperProps={{ style: { width: '870px' } }}>
            <DialogTitle id='dialog-title' style={{fontSize: 15, backgroundColor: '#404040', color: 'white', height: '20px'}}>{getTitle()}</DialogTitle>
            <DialogContent>
                <Grid container spacing={3}>
                    <Grid item xs={6}>
                        <TextField className="alert-name" size='small' label='Enter the alert name' value={alertConfiguration.alertName} onChange={(e) => handleInputChange('blastName', e.target.value)} fullWidth margin='normal' style={{marginTop: '35px', marginBottom: '5px'}} required/>
                        <Autocomplete className="alert-client" size='small' renderInput={(params) => <TextField {...params} label='Select the client' />} style={{marginTop: '5px', marginBottom: '5px'}}
                                      getOptionLabel={(option) => String(option)} options={clientService.getClients().map(client => client.clientName)}
                                      value={alertConfiguration.clientName} onChange={(_, newValue) => handleInputChange('clientName', newValue)} required />
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
