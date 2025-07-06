import {Button, Tooltip, Typography} from "@mui/material";
import {AlertConfigurationsDialogStageOneComponent} from "./AlertConfigurationsDialogStageOneComponent";
import {AlertConfigurationsDialogStageTwoComponent} from "./AlertConfigurationsDialogStageTwoComponent";
import {AlertConfigurationsDialogStageThreeComponent} from "./AlertConfigurationsDialogStageThreeComponent";
import {AlertConfigurationsDialogStageFourComponent} from "./AlertConfigurationsDialogStageFourComponent";
import {AlertConfigurationsDialogStageFiveComponent} from "./AlertConfigurationsDialogStageFiveComponent";
import {AlertConfigurationsDialogStageSixComponent} from "./AlertConfigurationsDialogStageSixComponent";
import React, {useCallback, useRef, useState, useMemo, useEffect} from "react";
import {AlertConfigurationsService} from "../services/AlertConfigurationsService";
import {LoggerService} from "../services/LoggerService";
import TitleBarComponent from "../components/TitleBarComponent";
import '../styles/css/main.css';
import {useRecoilState} from "recoil";
import {alertConfigurationState} from "../atoms/component-state";


export const AlertWizardApp = () =>
{
    const maxStage = 6;
    const [currentStage, setCurrentStage] = useState(1);
    const [alertConfiguration, setAlertConfiguration] = useRecoilState(alertConfigurationState);
    const alertConfigurationsService = useRef(new AlertConfigurationsService()).current;
    const loggerService = useRef(new LoggerService(AlertWizardApp.name)).current;
    const windowId = useMemo(() => window.command.getWindowId("Alert Wizard"), []);

    const handleCancel = () =>
    {
        loggerService.logInfo(`Cancelled alert configuration.`);
        window.command.close(windowId);
    };

    const handleSubmit = () =>
    {
        loggerService.logInfo(`Updated alert configuration: ${JSON.stringify(alertConfiguration)}.`);
        window.command.close(windowId);
    };

    const handleNext = () =>
    {
        setCurrentStage(prevStage => prevStage + 1);
    };

    const handleBack = () =>
    {
        setCurrentStage(prevStage =>
        {
            if(prevStage > 1)
                return prevStage - 1;
            return prevStage;
        });
    };

    const handleInputChange = useCallback((name, value) => {
        setAlertConfiguration(previous => ({
            ...previous,
            [name]: value
        }));
    }, []);

    useEffect(() =>
    {
        console.log("Alert Wizard App mounted: " + JSON.stringify(alertConfiguration));
    }, []);

    return(<>
            <TitleBarComponent title="Alert Configurations Wizard" windowId={windowId} addButtonProps={undefined} showChannel={false} showTools={false}/>
            <div style={{width: '100%', height: 'calc(100vh - 67px)', float: 'left', padding: '0px', margin:'45px 0px 0px 10px'}}>
                {currentStage === 1 ? <AlertConfigurationsDialogStageOneComponent handleInputChange={handleInputChange}/> : ""}
                {currentStage === 2 ? <AlertConfigurationsDialogStageTwoComponent handleInputChange={handleInputChange}/> : ""}
                {currentStage === 3 ? <AlertConfigurationsDialogStageThreeComponent handleInputChange={handleInputChange} alertConfigurationsService={alertConfigurationsService}/> : ""}
                {currentStage === 4 ? <AlertConfigurationsDialogStageFourComponent handleInputChange={handleInputChange}/> : ""}
                {currentStage === 5 ? <AlertConfigurationsDialogStageFiveComponent handleInputChange={handleInputChange}/> : ""}
                {currentStage === 6 ? <AlertConfigurationsDialogStageSixComponent handleInputChange={handleInputChange}/> : ""}
                <Tooltip title={<Typography fontSize={12}>Cancel and close configuration dialog window.</Typography>}>
                    <span>
                        <Button className="dialog-action-button" color="primary" variant='contained' onClick={handleCancel}>Cancel</Button>
                    </span>
                </Tooltip>
                {currentStage > 1 ? <Tooltip title={<Typography fontSize={12}>Go back to previous configuration stage.</Typography>}>
                    <span>
                        <Button className="dialog-action-button next" color="primary" variant='contained' onClick={handleBack}>Back</Button>
                    </span>
                </Tooltip>: ""}
                {currentStage < maxStage ? <Tooltip title={<Typography fontSize={12}>Go to next configuration stage.</Typography>}>
                    <span>
                        <Button className="dialog-action-button next" color="primary" variant='contained' onClick={handleNext}>Next</Button>
                    </span>
                </Tooltip>: ""}
                {currentStage === maxStage ? <Tooltip title={<Typography fontSize={12}>Submit the changes.</Typography>}>
                    <span>
                        <Button className="dialog-action-button submit" color="primary" variant='contained' onClick={handleSubmit}>Submit</Button>
                    </span>
                </Tooltip>: ""}
            </div>
        </>);
}
