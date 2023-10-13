import {Button, Tooltip, Typography} from "@mui/material";
import {AlertConfigurationsDialogStageOneComponent} from "./AlertConfigurationsDialogStageOneComponent";
import {AlertConfigurationsDialogStageTwoComponent} from "./AlertConfigurationsDialogStageTwoComponent";
import {AlertConfigurationsDialogStageThreeComponent} from "./AlertConfigurationsDialogStageThreeComponent";
import {AlertConfigurationsDialogStageFourComponent} from "./AlertConfigurationsDialogStageFourComponent";
import {AlertConfigurationsDialogStageFiveComponent} from "./AlertConfigurationsDialogStageFiveComponent";
import React, {useCallback, useRef, useState, useMemo, useEffect} from "react";
import {AlertConfigurationsService} from "../services/AlertConfigurationsService";
import {LoggerService} from "../services/LoggerService";
import {ClientService} from "../services/ClientService";
import TitleBarComponent from "../components/TitleBarComponent";
import '../styles/css/main.css';

export const AlertWizardApp = () =>
{
    const defaultAlertConfiguration =
    {
        alertConfigurationId: "",
        alertName: "",
        type: "",
        frequency: "",
        clientId: "",
        desk: "ALL",
        side: "N/A",
        market: "ALL",
        customizations: "",
        isActive: "true",
        advMin: "",
        advMax: "",
        notionalMin: "",
        notionalMax: "",
        messageTemplate: "",
        priority: "High"
    };

    const maxStage = 5;
    const [currentStage, setCurrentStage] = useState(1);
    const [alertConfiguration] = useState(defaultAlertConfiguration);
    const alertConfigurationsService = useRef(new AlertConfigurationsService()).current;
    const loggerService = useRef(new LoggerService(AlertWizardApp.name)).current;
    const clientService = useRef(new ClientService()).current;
    const windowId = useMemo(() => window.command.getWindowId("alert-wizard"), []);

    const handleCancel = () =>
    {
    };

    const handleSubmit = () =>
    {
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

    const handleInputChange = useCallback((name, value) =>
    {
    }, []);

    useEffect(() =>
    {
        const loadData = async () =>
        {
            await clientService.loadClients();
        };

        loadData().then(() => loggerService.logInfo("Clients loaded successfully: " + JSON.stringify(clientService.getClients())));
    }, []);

    return(<>
            <TitleBarComponent title="Alert Configurations Wizard" windowId={windowId} addButtonProps={undefined} showChannel={false} showTools={false}/>
            <div style={{width: '100%', height: 'calc(100vh - 67px)', float: 'left', padding: '0px', margin:'45px 0px 0px 10px'}}>
                {currentStage === 1 ? <AlertConfigurationsDialogStageOneComponent clientService={clientService} handleInputChange={handleInputChange} alertConfiguration={alertConfiguration}/> : ""}
                {currentStage === 2 ? <AlertConfigurationsDialogStageTwoComponent handleInputChange={handleInputChange} alertConfiguration={alertConfiguration}/> : ""}
                {currentStage === 3 ? <AlertConfigurationsDialogStageThreeComponent handleInputChange={handleInputChange} alertConfiguration={alertConfiguration} alertConfigurationsService={alertConfigurationsService}/> : ""}
                {currentStage === 4 ? <AlertConfigurationsDialogStageFourComponent handleInputChange={handleInputChange} alertConfiguration={alertConfiguration}/> : ""}
                {currentStage === 5 ? <AlertConfigurationsDialogStageFiveComponent handleInputChange={handleInputChange} alertConfiguration={alertConfiguration}/> : ""}
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
