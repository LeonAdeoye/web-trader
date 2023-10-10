import {Autocomplete, Button, Dialog, DialogActions, DialogContent, DialogTitle} from "@mui/material";
import {MenuItem, TextField, Tooltip, Typography} from "@mui/material";
import React, {useCallback, useState} from "react";
import {useRecoilState} from "recoil";
import {alertConfigurationsDialogDisplayState} from "../atoms/dialog-state";
import {selectedGenericGridRowState} from "../atoms/component-state";

export const AlertConfigurationsDialog = ({ onCloseHandler , clientService }) =>
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
            isActive: "true",
        }

    const [selectedGenericGridRow] = useRecoilState(selectedGenericGridRowState);
    const [alertConfigurationsDialogDisplay, setAlertConfigurationsDialogDisplay] = useRecoilState(alertConfigurationsDialogDisplayState);
    const [alertConfiguration, setAlertConfiguration] = useState(defaultAlertConfiguration);
    const [currentStage, setCurrentStage] = useState(1);

    const handleCancel = () =>
    {
        setAlertConfigurationsDialogDisplay(false);
    }

    const handleSubmit = () =>
    {
        setAlertConfigurationsDialogDisplay(false);
        onCloseHandler(alertConfiguration);
    }

    const handleNext = () =>
    {
        setCurrentStage(prevStage => prevStage + 1);
    }

    const handleBack = () =>
    {
        setCurrentStage(prevStage =>
        {
            if(prevStage > 1)
                return prevStage - 1;
            return prevStage;
        });
    }

    const getTitle = () =>
    {
        if(!selectedGenericGridRow)
            return "Add New Alert Configuration";

        if(selectedGenericGridRow?.alertConfigurationId)
            return "Update Existing Alert Configuration";

        return "Clone Existing Alert Configuration";
    }

    const handleInputChange = useCallback((name, value) =>
    {
        setAlertConfiguration(prevData => ({ ...prevData, [name]: value }));
    }, []);

    return (<Dialog aria-labelledby='dialog-title' maxWidth={false} fullWidth={true} open={alertConfigurationsDialogDisplay} onClose={handleCancel} PaperProps={{ style: { width: '570px' } }}>
            <DialogTitle id='dialog-title' style={{fontSize: 15, backgroundColor: '#404040', color: 'white', height: '20px'}}>{getTitle()}</DialogTitle>
            <DialogContent>
                {currentStage === 1 ?<div className={"alert-config-stage-one"}>
                    <TextField className="alert-name" size='small' label='Enter the alert name' value={alertConfiguration.alertName}
                               onChange={(e) => handleInputChange('alertName', e.target.value)} margin='normal'
                               style={{marginTop: '10px', marginBottom: '5px', width:'500px'}} required/>

                    <Autocomplete renderInput={(params) => <TextField {...params} label='Select the client' />} size='small'
                                  style={{marginTop: '5px', marginBottom: '5px', width:'500px' }} value={alertConfiguration.clientName} className="alert-client"
                                  getOptionLabel={(option) => String(option)} options={clientService.getClients().map(client => client.clientName)}
                                  onChange={(_, newValue) => handleInputChange('clientName', newValue)} required />

                    <TextField className="alert-desk" style={{marginTop: '5px', marginBottom: '5px', width:'500px'}} size='small' label='Select the desk'
                               onChange={(event) => handleInputChange('desk', event.target.value)} select value={alertConfiguration.desk}>
                        <MenuItem value='LT'>Low touch</MenuItem>
                        <MenuItem value='PT'>Program Trading</MenuItem>
                        <MenuItem value='HT'>High Touch</MenuItem>
                        <MenuItem value='FACIL'>Facilitation</MenuItem>
                    </TextField>

                    <TextField className="alert-side" stye={{marginTop: '5px', marginBottom: '5px', width:'500px'}} size='small' label='Select the side'
                               onChange={(event) => handleInputChange('side', event.target.value)} select value={alertConfiguration.side}>
                        <MenuItem value='N/A'>Not Applicable</MenuItem>
                        <MenuItem value='Sell'>Sell</MenuItem>
                        <MenuItem value='shortSell'>Short Sell</MenuItem>
                        <MenuItem value='Buy'>Buy</MenuItem>
                    </TextField>
                </div>: ""}
                {currentStage === 2 ? <div className={"alert-config-stage-two"}>
                    <TextField className="alert-name" size='small' label='Enter the alert name' value={alertConfiguration.alertName}
                               onChange={(e) => handleInputChange('alertName', e.target.value)} margin='normal'
                               style={{marginTop: '10px', marginBottom: '5px', width:'500px'}} required/>

                    <Autocomplete renderInput={(params) => <TextField {...params} label='Select the client' />} size='small'
                                  style={{marginTop: '5px', marginBottom: '5px', width:'500px' }} value={alertConfiguration.clientName} className="alert-client"
                                  getOptionLabel={(option) => String(option)} options={clientService.getClients().map(client => client.clientName)}
                                  onChange={(_, newValue) => handleInputChange('clientName', newValue)} required />

                    <TextField className="alert-desk" style={{marginTop: '5px', marginBottom: '5px', width:'500px'}} size='small' label='Select the desk'
                               onChange={(event) => handleInputChange('desk', event.target.value)} select value={alertConfiguration.desk}>
                        <MenuItem value='LT'>Low touch</MenuItem>
                        <MenuItem value='PT'>Program Trading</MenuItem>
                        <MenuItem value='HT'>High Touch</MenuItem>
                        <MenuItem value='FACIL'>Facilitation</MenuItem>
                    </TextField>
                </div> : ""}
            </DialogContent>
            <DialogActions style={{height: '35px'}}>
                <Tooltip title={<Typography fontSize={12}>Cancel and close configuration dialog window.</Typography>}>
                    <span>
                        <Button className="dialog-action-button" color="primary" variant='contained' onClick={handleCancel}>Cancel</Button>
                    </span>
                </Tooltip>
                {currentStage < 2 ? <Tooltip title={<Typography fontSize={12}>Go to next configuration stage.</Typography>}>
                    <span>
                        <Button className="dialog-action-button next" color="primary" variant='contained' onClick={handleNext}>Next</Button>
                    </span>
                </Tooltip>: ""}
                {currentStage > 1 ? <Tooltip title={<Typography fontSize={12}>Go back to previous configuration stage.</Typography>}>
                    <span>
                        <Button className="dialog-action-button next" color="primary" variant='contained' onClick={handleBack}>Back</Button>
                    </span>
                </Tooltip>: ""}
                {currentStage === 2 ? <Tooltip title={<Typography fontSize={12}>Submit the changes.</Typography>}>
                    <span>
                        <Button className="dialog-action-button submit" color="primary" variant='contained' onClick={handleSubmit}>Submit</Button>
                    </span>
                </Tooltip>: ""}
            </DialogActions>
        </Dialog>);
}
