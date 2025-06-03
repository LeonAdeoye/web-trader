import React, {useEffect, useMemo, useState, useRef} from "react";
import TitleBarComponent from "../components/TitleBarComponent";
import {useRecoilState} from "recoil";
import {GenericGridComponent} from "../components/GenericGridComponent";
import ActionIconsRenderer from "../components/ActionIconsRenderer";
import {AlertConfigurationsService} from "../services/AlertConfigurationsService";
import {alertConfigurationState, selectedGenericGridRowState} from "../atoms/component-state";
import {LoggerService} from "../services/LoggerService";
import {ClientService} from "../services/ClientService";
import CheckboxRenderer from "../components/CheckboxRenderer";
import cronstrue from 'cronstrue';
import SideRenderer from "../components/SideRenderer";


export const AlertConfigurationsApp = () =>
{
    const [selectedGenericGridRow, setSelectedGenericGridRow ] = useRecoilState(selectedGenericGridRowState);
    const [alertConfiguration, setAlertConfiguration] = useRecoilState(alertConfigurationState);

    const [alertConfigurations, setAlertConfigurations] = useState([]);
    const [ownerId, setOwnerId] = useState('');

    const alertConfigurationsService = useRef(new AlertConfigurationsService()).current;
    const loggerService = useRef(new LoggerService(AlertConfigurationsApp.name)).current;
    const clientService = useRef(new ClientService()).current;

    const windowId = useMemo(() => window.command.getWindowId("alert configurations"), []);
    const columnDefs = useMemo(() =>
    ([
        {headerName: "Id", field: "id", hide: true, sortable: false, minWidth: 110, width: 110},
        {headerName: "Alert Type", field: "alertType", sortable: true, minWidth: 200, width: 200, filter: true},
        {headerName: "Alert Name", field: "alertName", sortable: true, minWidth: 200, width: 200, filter: true},
        {headerName: "Priority", field: "priority", sortable: true, minWidth: 90, width: 90, filter: true},
        {headerName: "Start Time", field: "startTime", sortable: true, minWidth: 120, width: 120, filter: true, valueFormatter: (params) => new Date(params.data.startTime).toLocaleTimeString()},
        {headerName: "End Time", field: "endTime", sortable: true, minWidth: 120, width: 120, filter: true, valueFormatter: (params) => new Date(params.data.endTime).toLocaleTimeString()},
        {headerName: "Frequency", field: "frequency", sortable: true, minWidth: 220, width: 240, valueGetter: (params) => cronstrue.toString(params.data.frequency, {throwExceptionOnParseError: false}) || "N/A", filter: true},
        {headerName: "Client", field: "clientId", sortable: true, minWidth: 100, width: 200, filter: true, valueGetter: (params) => clientService.getClientName("651baff39b4d394648e577d2") },
        {headerName: "Desk", field: "deskId", sortable: true, minWidth: 110, width: 110, filter: true},
        {headerName: "Exchanges", field: "exchanges", sortable: true, minWidth: 110, width: 130, filter: true},
        {headerName: "Side", field: "side", sortable: true, minWidth: 90, width: 90, filter: true, cellRenderer: SideRenderer},
        {headerName: "Customizations", field: "customizations", sortable: true, minWidth: 150, width: 150, filter: true},
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
                    const index = previousAlertConfigurations.findIndex(currentAlertConfiguration => currentAlertConfiguration.id === alertConfigurationToUpdate.id);
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

    const deleteAlertConfiguration = async (ownerId, id) =>
    {
        try
        {
            loggerService.logInfo(`Deleting existing alert configuration with owner Id: ${ownerId} id: ${id}.`);
            alertConfigurationsService.deleteAlertConfiguration(ownerId, id)
                .then(() => setAlertConfigurations(previousAlertConfigurations =>
                {
                    const index = previousAlertConfigurations.findIndex(alertConfiguration => alertConfiguration.id === id);
                    previousAlertConfigurations.splice(index, 1);
                    return [...previousAlertConfigurations];
                }));
        }
        catch (error)
        {
            loggerService.logError(error);
        }
    }

    const handleAction = async (action, alertConfiguration) =>
    {
        console.log("Handle " + action + " action on alert configuration: " + JSON.stringify(alertConfiguration));
        switch(action)
        {
            case "update":
                setSelectedGenericGridRow(alertConfigurations.find(config => config.id === alertConfiguration.id));
                launchWizardApp();
                break;
            case "delete":
                await deleteAlertConfiguration(alertConfiguration.id)
                break;
            case "clone":
                let alertConfig = alertConfigurations.find(config => config.id === alertConfiguration.id);
                setAlertConfiguration({...alertConfig, id: null})
                setSelectedGenericGridRow({...alertConfig, id: null});
                launchWizardApp();
                break;
            case "add":
                setSelectedGenericGridRow(null);
                launchWizardApp();
                break;
            default:
                loggerService.logError(`Unknown action: ${action} for alert configurationId: ${alertConfiguration.id}`);
        }
    };

    useEffect(() =>
    {
        const loadOwner = async () =>  setOwnerId(await window.configurations.getLoggedInUserId());
        loadOwner();
    }, []);

    useEffect(() =>
    {
        if(ownerId)
        {
            const loadData = async () =>
            {
                await clientService.loadClients();
                await alertConfigurationsService.loadAlertConfigurations(ownerId);
            };

            // ALERT CONFIGURATION SAMPLE POSTMAN JSON BODY:
            // {
            //     "alertName": "JP Morgan Order Rejects",
            //     "ownerId": "ladeoye",
            //     "side": "BUY",
            //     "deskId": "123e4567-e89b-12d3-a456-426614174000",
            //     "alertType": "ORDER_REJECTIONS",
            //     "startTime": "2025-06-03T08:00:00",
            //     "endTime": "2025-06-03T14:00:00",
            //     "frequency": "0 10 * * 1-5",
            //     "isActive": true,
            //     "exchanges": ["HKSE"],
            //     "priority": "HIGH",
            //     "clientId": "123e4567-e89b-12d3-a456-426614174000",
            //     "customizations": "Custom alert settings"
            // }
            loadData().then(() => setAlertConfigurations(alertConfigurationsService.getAlertConfigurations()));
        }
    }, [ownerId]);

    const launchWizardApp = () =>
    {
        // TODO move to config
        window.launchPad.openApp({url: 'http://localhost:3000/alert-wizard', title: "Alert Configurations Wizard", modalFlag: true});
    }

   return(
        <>
            <TitleBarComponent title="Alert Configurations" windowId={windowId} addButtonProps={{
                handler: () => launchWizardApp(),
                tooltipText: "Add new alert configuration..."
            }} showChannel={false} showTools={false}/>
            <div style={{ width: '100%', height: 'calc(100vh - 65px)', float: 'left', padding: '0px', margin:'45px 0px 0px 0px'}}>
                <GenericGridComponent rowHeight={22} gridTheme={"ag-theme-alpine"} rowIdArray={["id"]}
                                      columnDefs={columnDefs} gridData={alertConfigurations} handleAction={handleAction}/>
            </div>
        </>);
}
