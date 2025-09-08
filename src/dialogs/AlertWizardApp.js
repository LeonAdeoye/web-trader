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
import {ServiceRegistry} from "../services/ServiceRegistry";
import TitleBarComponent from "../components/TitleBarComponent";
import '../styles/css/main.css';
import {useRecoilState} from "recoil";
import {alertConfigurationState} from "../atoms/component-state";


export const AlertWizardApp = () =>
{
    const maxStage = 6;
    const [currentStage, setCurrentStage] = useState(1);
    const [alertConfiguration, setAlertConfiguration] = useRecoilState(alertConfigurationState);
    const alertConfigurationsService = useRef(ServiceRegistry.getAlertConfigurationsService()).current;
    const clientService = useRef(ServiceRegistry.getClientService()).current;
    const traderService = useRef(ServiceRegistry.getTraderService()).current;
    const loggerService = useRef(new LoggerService(AlertWizardApp.name)).current;
    const windowId = useMemo(() => window.command.getWindowId("Alert Wizard"), []);

    const handleCancel = () =>
    {
        loggerService.logInfo(`Cancelled alert configuration.`);
        window.command.close(windowId);
    };

    const handleSubmit = async () =>
    {
        try
        {
            // Get logged in user ID
            const loggedInUserId = await window.configurations.getLoggedInUserId();
            
            // Load services data if needed
            await clientService.loadClients();
            await traderService.loadTraders();
            
            // Get IDs from names
            const clientId = clientService.getClientId(alertConfiguration.clientName);
            const deskId = traderService.getDeskId(alertConfiguration.desk);
            
            // Prepare alert configuration data for the service
            const alertConfigData = {
                ownerId: loggedInUserId,
                alertName: alertConfiguration.alertName || '',
                clientId: clientId || null,
                clientName: alertConfiguration.clientName || '', // Keep for backward compatibility
                deskId: deskId || null,
                desk: alertConfiguration.desk || '', // Keep for backward compatibility
                side: alertConfiguration.side || '',
                market: alertConfiguration.market || '',
                exchanges: [alertConfiguration.market].filter(Boolean), // Convert market to exchanges array
                priority: alertConfiguration.priority || '',
                advMin: alertConfiguration.advMin || '',
                advMax: alertConfiguration.advMax || '',
                notionalOrADV: alertConfiguration.notionalOrADV || false,
                notionalAndADV: alertConfiguration.notionalAndADV || false,
                notionalMin: alertConfiguration.notionalMin || '',
                notionalMax: alertConfiguration.notionalMax || '',
                alertType: alertConfiguration.alertType || '',
                messageTemplate: alertConfiguration.messageTemplate || '',
                emailAddress: alertConfiguration.emailAddress || '',
                startTime: alertConfiguration.frequency?.startTime || '',
                endTime: alertConfiguration.frequency?.endTime || '',
                frequency: alertConfiguration.frequency?.cronExpression || '',
                isActive: true, // Default to active
                customizations: '', // Default empty
                createdOn: new Date().toISOString(),
                lastUpdatedOn: new Date().toISOString()
            };

            // Save the alert configuration using the service
            const savedConfig = await alertConfigurationsService.addNewAlertConfiguration(alertConfigData);
            
            if (savedConfig)
            {
                // Show success message with the saved configuration
                const jsonMessage = JSON.stringify(savedConfig, null, 2);
                alert(`Alert Configuration Successfully Saved!\n\n${jsonMessage}`);
                
                // Trigger refresh of Alert Configuration app via IPC
                window.command.sendMessageToMain('refresh-alert-configurations');
                
                loggerService.logInfo(`Successfully saved alert configuration: ${JSON.stringify(savedConfig)}.`);
            }
            else
            {
                alert('Failed to save alert configuration. Please try again.');
                loggerService.logError('Failed to save alert configuration');
            }
        }
        catch (error)
        {
            loggerService.logError(`Error saving alert configuration: ${error.message}`);
            alert(`Error saving alert configuration: ${error.message}`);
        }
        finally
        {
            window.command.close(windowId);
        }
    };

    const handleNext = () =>
    {
        // Validate email on Stage 5 before proceeding
        if (currentStage === 5 && alertConfiguration.emailAddress)
        {
            if (!alertConfiguration.emailAddress.includes('@') || !alertConfiguration.emailAddress.includes('.'))
            {
                alert('Please enter a valid email address (must contain @ and .)');
                return;
            }
        }
        
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
