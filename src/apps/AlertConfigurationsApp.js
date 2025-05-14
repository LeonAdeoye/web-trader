import React, {useEffect, useMemo, useState, useRef} from "react";
import TitleBarComponent from "../components/TitleBarComponent";
import {useRecoilState} from "recoil";
import {alertConfigurationsDialogDisplayState} from "../atoms/dialog-state";
import {GenericGridComponent} from "../components/GenericGridComponent";
import ActionIconsRenderer from "../components/ActionIconsRenderer";
import {AlertConfigurationsService} from "../services/AlertConfigurationsService";
import {selectedGenericGridRowState} from "../atoms/component-state";
import {LoggerService} from "../services/LoggerService";
import {ClientService} from "../services/ClientService";
import CheckboxRenderer from "../components/CheckboxRenderer";

export const AlertConfigurationsApp = () =>
{
    const [, setAlertConfigurationsDialogDisplay] = useRecoilState(alertConfigurationsDialogDisplayState);
    const [, setSelectedGenericGridRow ] = useRecoilState(selectedGenericGridRowState);

    const [alertConfigurations, setAlertConfigurations] = useState([]);
    const [ownerId, setOwnerId] = useState('');

    const alertConfigurationsService = useRef(new AlertConfigurationsService()).current;
    const loggerService = useRef(new LoggerService(AlertConfigurationsApp.name)).current;
    const clientService = useRef(new ClientService()).current;

    const windowId = useMemo(() => window.command.getWindowId("alert configurations"), []);
    const columnDefs = useMemo(() =>
    ([
        {headerName: "Id", field: "alertConfigurationId", hide: true, sortable: false, minWidth: 130, width: 130},
        {headerName: "Type", field: "type", sortable: true, minWidth: 150, width: 150, filter: true},
        {headerName: "Alert Name", field: "alertName", sortable: true, minWidth: 160, width: 160, filter: true},
        {headerName: "Frequency", field: "frequency", sortable: true, minWidth: 100, width: 100},
        {headerName: "Client", field: "client", sortable: true, minWidth: 100, width: 200, filter: true},
        {headerName: "Desk", field: "desk", sortable: true, minWidth: 110, width: 110, filter: true},
        {headerName: "Exchanges", field: "exchanges", sortable: true, minWidth: 110, width: 110, filter: true},
        {headerName: "Side", field: "side", sortable: true, minWidth: 90, width: 90, filter: true},
        {headerName: "Customizations", field: "client", sortable: true, minWidth: 150, width: 150, filter: true},
        {headerName: "Is Active", field: "isActive", sortable: false, minWidth: 90, width: 90, filter: false, cellRenderer: CheckboxRenderer},
        {headerName: "Actions", field: "actions", sortable: false, minWidth: 140, width: 140, filter: false, cellRenderer: ActionIconsRenderer}
    ]), []);

    const saveAlertConfiguration = async (alertConfigurationToSave) =>
    {
        try
        {
            loggerService.logInfo(`User adding new alert configuration: ${JSON.stringify(alertConfigurationToSave)}`);
            alertConfigurationsService.addNewAlertConfiguration(alertConfigurationToSave)
                .then((newAlertConfiguration) => setAlertConfigurations([...alertConfigurations, newAlertConfiguration]));
        }
        catch (error)
        {
            loggerService.logError(error);
        }
    }

    const updateAlertConfiguration = async (alertConfigurationToUpdate) =>
    {
        try
        {
            loggerService.logInfo(`Updating existing alert configuration:${JSON.stringify(alertConfigurationToUpdate)}`);
            alertConfigurationsService.updateAlertConfiguration(alertConfigurationToUpdate)
                .then(() => setAlertConfigurations(previousAlertConfigurations =>
                {
                    const index = previousAlertConfigurations.findIndex(currentAlertConfiguration => currentAlertConfiguration.alertConfigurationId === alertConfigurationToUpdate.alertConfigurationId);
                    previousAlertConfigurations[index] = alertConfigurationToUpdate;
                    setSelectedGenericGridRow(alertConfigurationToUpdate);
                    return [...previousAlertConfigurations];
                }));
        }
        catch (error)
        {
            loggerService.logError(error);
        }
    }

    const deleteAlertConfiguration = async (alertConfigurationId) =>
    {
        try
        {
            loggerService.logInfo(`Deleting existing alert configuration with owner Id: ${ownerId} alertConfigurationId: ${alertConfigurationId}.`);
            alertConfigurationsService.deleteAlertConfiguration(ownerId, alertConfigurationId)
                .then(() => setAlertConfigurations(previousAlertConfigurations =>
                {
                    const index = previousAlertConfigurations.findIndex(alertConfiguration => alertConfiguration.alertConfigurationId === alertConfigurationId);
                    previousAlertConfigurations.splice(index, 1);
                    return [...previousAlertConfigurations];
                }));
        }
        catch (error)
        {
            loggerService.logError(error);
        }
    }

    const handleAction = async (action, alertConfigurationId) =>
    {
        switch(action)
        {
            case "update":
                setSelectedGenericGridRow(alertConfigurations.find(config => config.alertConfigurationId === alertConfigurationId));
                launchWizardApp();
                break;
            case "delete":
                await deleteAlertConfiguration(windowId, alertConfigurationId)
                break;
            case "clone":
                let alertConfig = alertConfigurations.find(config => config.alertConfigurationId === alertConfigurationId);
                setSelectedGenericGridRow({...alertConfig, alertConfigurationId: null});
                launchWizardApp();
                break;
            case "add":
                setSelectedGenericGridRow(null);
                launchWizardApp();
                break;
            default:
                loggerService.logError(`Unknown action: ${action} for alertConfigurationId: ${alertConfigurationId}`);
        }
    };

    useEffect(() =>
    {
        const loadOwner = async () =>  setOwnerId(await window.configurations.getLoggedInUserId());
        loadOwner();
    }, []);

    useEffect(() =>
    {
        const loadData = async () =>
        {
            await clientService.loadClients();
            await alertConfigurationsService.loadAlertConfigurations();
        };

        if(ownerId)
        {
            loadData().then(() =>
            {
                setAlertConfigurations([{alertConfigurationId:1, alertName: "JP Morgan Order Rejects", type: "Order Rejections", time: "10:00", priority: "High", clientId: "Client 1", isActive: true},
                    {alertConfigurationId:2, alertName: "Client Amendment Rejects", type:  "Amendment Rejections", time: "10:00", priority: "High", clientId: null, isActive: false},
                    {alertConfigurationId:3, alertName: "Client Order Rejects", type:  "Order Rejections", time: "09:00", priority: "High", clientId: null, isActive: true}])
            });
        }
    }, [ownerId]);

    const launchWizardApp = () =>
    {
        //TODO move to config
        window.launchPad.openApp({url: 'http://localhost:3000/alert-wizard', title: "Alert Configurations Wizard", modalFlag: true});
    }

   return(
        <>
            <TitleBarComponent title="Alert Configurations" windowId={windowId} addButtonProps={{
                handler: () => launchWizardApp(),
                tooltipText: "Add new alert configuration..."
            }} showChannel={false} showTools={false}/>
            <div style={{ width: '100%', height: 'calc(100vh - 65px)', float: 'left', padding: '0px', margin:'45px 0px 0px 0px'}}>
                <GenericGridComponent rowHeight={22} gridTheme={"ag-theme-alpine"} rowIdArray={["alertConfigurationId"]}
                                      columnDefs={columnDefs} gridData={alertConfigurations} handleAction={handleAction}/>
            </div>
        </>);
}
