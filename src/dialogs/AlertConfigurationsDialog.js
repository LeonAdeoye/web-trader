import {Button, Dialog, DialogActions, DialogContent, DialogTitle} from "@mui/material";
import {Tooltip, Typography} from "@mui/material";
import React, {useCallback, useState} from "react";
import {useRecoilState} from "recoil";
import {alertConfigurationsDialogDisplayState} from "../atoms/dialog-state";
import {selectedGenericGridRowState} from "../atoms/component-state";
import {AlertConfigurationsDialogStageOneComponent} from "../dialogs/AlertConfigurationsDialogStageOneComponent";
import {AlertConfigurationsDialogStageTwoComponent} from "../dialogs/AlertConfigurationsDialogStageTwoComponent";


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
    };

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
                    {currentStage === 1 ?<AlertConfigurationsDialogStageOneComponent clientService={clientService} handleInputChange={handleInputChange} alertConfiguration={alertConfiguration}/>: ""}
                    {currentStage === 2 ?<AlertConfigurationsDialogStageTwoComponent clientService={clientService} handleInputChange={handleInputChange} alertConfiguration={alertConfiguration}/>:""}
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