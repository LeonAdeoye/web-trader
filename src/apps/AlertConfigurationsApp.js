import React, {useEffect, useMemo, useState, useRef} from "react";
import TitleBarComponent from "../components/TitleBarComponent";
import {useRecoilState} from "recoil";
import {GenericGridComponent} from "../components/GenericGridComponent";
import ActionIconsRenderer from "../components/ActionIconsRenderer";
import {AlertConfigurationsService} from "../services/AlertConfigurationsService";
import {alertConfigurationState, selectedGenericGridRowState} from "../atoms/component-state";
import {LoggerService} from "../services/LoggerService";
import { ServiceRegistry } from "../services/ServiceRegistry";
import CheckboxRenderer from "../components/CheckboxRenderer";
import cronstrue from 'cronstrue';
import SideRenderer from "../components/SideRenderer";
import { formatTime, formatTimeFromISO } from "../utilities";


export const AlertConfigurationsApp = () =>
{
    const [, setSelectedGenericGridRow ] = useRecoilState(selectedGenericGridRowState);
    const [, setAlertConfiguration] = useRecoilState(alertConfigurationState);

    const [alertConfigurations, setAlertConfigurations] = useState([]);
    const [ownerId, setOwnerId] = useState('');

    // TODO: REMOVE THIS DUMMY DATA - Temporary dummy data for testing grid display
    const dummyAlertConfigurations = [
        {
            id: 'dummy-1',
            alertName: 'JP Morgan Order Rejects',
            alertType: 'ORDER_REJECTIONS',
            priority: 'HIGH',
            startTime: '08:00:00',
            endTime: '16:00:00',
            frequency: {
                startTime: '08:00:00',
                endTime: '16:00:00',
                cronExpression: '0 10 * * 1-5'
            },
            clientId: 'client-123',
            clientName: 'JP Morgan',
            deskId: 'desk-456',
            desk: 'LT',
            side: 'BUY',
            market: 'SG',
            exchanges: ['SG'],
            advMin: '10',
            advMax: '100',
            notionalMin: '1000',
            notionalMax: '5000',
            notionalOrADV: true,
            notionalAndADV: false,
            emailAddress: 'trader@jpmorgan.com',
            messageTemplate: 'Order rejected for {client} - {reason}',
            isActive: true,
            customizations: 'Custom alert settings for JP Morgan'
        },
        {
            id: 'dummy-2',
            alertName: 'Goldman Sachs Price Alerts',
            alertType: 'PRICE_ALERTS',
            priority: 'MEDIUM',
            startTime: '09:30:00',
            endTime: '15:30:00',
            frequency: {
                startTime: '09:30:00',
                endTime: '15:30:00',
                cronExpression: '*/15 * * * 1-5'
            },
            clientId: 'client-789',
            clientName: 'Goldman Sachs',
            deskId: 'desk-101',
            desk: 'HK',
            side: 'SELL',
            market: 'HK',
            exchanges: ['HKSE'],
            advMin: '5',
            advMax: '50',
            notionalMin: '500',
            notionalMax: '2500',
            notionalOrADV: false,
            notionalAndADV: true,
            emailAddress: 'alerts@goldman.com',
            messageTemplate: 'Price alert triggered: {symbol} at {price}',
            isActive: true,
            customizations: 'High frequency price monitoring'
        },
        {
            id: 'dummy-3',
            alertName: 'Morgan Stanley Volume Breach',
            alertType: 'VOLUME_BREACH',
            priority: 'LOW',
            startTime: '10:00:00',
            endTime: '14:00:00',
            frequency: {
                startTime: '10:00:00',
                endTime: '14:00:00',
                cronExpression: '0 0 * * 1-5'
            },
            clientId: 'client-456',
            clientName: 'Morgan Stanley',
            deskId: 'desk-202',
            desk: 'NY',
            side: 'BUY',
            market: 'US',
            exchanges: ['NYSE'],
            advMin: '20',
            advMax: '200',
            notionalMin: '2000',
            notionalMax: '10000',
            notionalOrADV: true,
            notionalAndADV: false,
            emailAddress: 'risk@morganstanley.com',
            messageTemplate: 'Volume breach detected: {volume} exceeds {limit}',
            isActive: false,
            customizations: 'Risk management alerts'
        }
    ];

    const alertConfigurationsService = useRef(ServiceRegistry.getAlertConfigurationsService()).current;
    const loggerService = useRef(new LoggerService(AlertConfigurationsApp.name)).current;
    const clientService = useRef(ServiceRegistry.getClientService()).current;
    const traderService = useRef(ServiceRegistry.getTraderService()).current;

    const windowId = useMemo(() => window.command.getWindowId("Alert Configurations"), []);
    const columnDefs = useMemo(() =>
    ([
        {headerName: "Id", field: "id", hide: true, sortable: false, minWidth: 110, width: 110},
        {headerName: "Alert Type", field: "alertType", sortable: true, minWidth: 170, width: 170, filter: true},
        {headerName: "Alert Name", field: "alertName", sortable: true, minWidth: 180, width: 180, filter: true},
        {headerName: "Priority", field: "priority", sortable: true, minWidth: 100, width: 100, filter: true},
        {headerName: "Start Time", field: "startTime", sortable: true, minWidth: 100, width: 100, filter: true, valueFormatter: (params) => {
            const timeValue = params.data?.frequency?.startTime || params.data?.startTime;
            return formatTimeFromISO(timeValue);
        }},
        {headerName: "End Time", field: "endTime", sortable: true, minWidth: 100, width: 100, filter: true, valueFormatter: (params) => {
            const timeValue = params.data?.frequency?.endTime || params.data?.endTime;
            return formatTimeFromISO(timeValue);
        }},
        {headerName: "Frequency", field: "frequency", sortable: true, minWidth: 200, width: 200, valueGetter: (params) => {
            if (!params.data) return "N/A";
            const cronExpression = params.data.frequency?.cronExpression || params.data.frequency;
            return cronstrue.toString(cronExpression, {throwExceptionOnParseError: false}) || "N/A";
        }, filter: true, tooltipValueGetter: (params) => {
            if (!params.data) return "N/A";
            const cronExpression = params.data.frequency?.cronExpression || params.data.frequency;
            const humanReadable = cronstrue.toString(cronExpression, {throwExceptionOnParseError: false}) || "N/A";
            const originalCron = cronExpression || "N/A";
            return `Human: ${humanReadable}\nCron: ${originalCron}`;
        }},
        {headerName: "Client", field: "clientId", sortable: true, minWidth: 120, width: 120, filter: true, valueGetter: (params) => {
            if (!params.data) return "N/A";
            const clientName = clientService.getClientName(params.data.clientId);
            return clientName || params.data.clientName || "N/A";
        }},
        {headerName: "Desk", field: "deskId", sortable: true, minWidth: 80, width: 80, filter: true, valueGetter: (params) => {
            if (!params.data) return "N/A";
            const deskName = traderService.getDeskName(params.data.deskId);
            return deskName || params.data.desk || "N/A";
        }},
        {headerName: "Market(s)", field: "market", sortable: true, minWidth: 100, width: 100, filter: true, valueGetter: (params) => params.data?.market || params.data?.exchanges || "N/A"},
        {headerName: "Side", field: "side", sortable: true, minWidth: 80, width: 80, filter: true, cellRenderer: SideRenderer},
        {headerName: "ADV Min", field: "advMin", sortable: true, minWidth: 100, width: 100, filter: true, valueGetter: (params) => params.data?.advMin || "N/A"},
        {headerName: "ADV Max", field: "advMax", sortable: true, minWidth: 100, width: 100, filter: true, valueGetter: (params) => params.data?.advMax || "N/A"},
        {headerName: "Notional Min", field: "notionalMin", sortable: true, minWidth: 130, width: 130, filter: true, valueGetter: (params) => params.data?.notionalMin || "N/A"},
        {headerName: "Notional Max", field: "notionalMax", sortable: true, minWidth: 130, width: 130, filter: true, valueGetter: (params) => params.data?.notionalMax || "N/A"},
        {headerName: "Logic", field: "logic", sortable: true, minWidth: 80, width: 80, filter: true, valueGetter: (params) => {
            if (!params.data) return "N/A";
            if (params.data.notionalAndADV) return "AND";
            if (params.data.notionalOrADV) return "OR";
            return "N/A";
        }},
        {headerName: "Email", field: "emailAddress", sortable: true, minWidth: 150, width: 150, filter: true, valueGetter: (params) => params.data?.emailAddress || "N/A"},
        {headerName: "Message", field: "messageTemplate", sortable: true, minWidth: 220, width: 220, filter: true, valueGetter: (params) => params.data?.messageTemplate || "N/A", tooltipValueGetter: (params) => params.data?.messageTemplate || "N/A"},
        {headerName: "Is Active", field: "isActive", sortable: false, minWidth: 80, width: 80, filter: false, cellRenderer: CheckboxRenderer, valueGetter: (params) => params.data?.isActive !== false},
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
                await traderService.loadTraders();
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
            loadData().then(() => {
                const realData = alertConfigurationsService.getAlertConfigurations();
                // TODO: REMOVE THIS - Use dummy data if no real data exists
                const dataToShow = realData.length > 0 ? realData : dummyAlertConfigurations;
                setAlertConfigurations(dataToShow);
            });
        }
    }, [ownerId]);

    // Listen for refresh messages from other apps
    useEffect(() =>
    {
        const handleRefresh = () =>
        {
            loggerService.logInfo('Received refresh message, reloading alert configurations...');
            const loadData = async () =>
            {
                await traderService.loadTraders();
                await alertConfigurationsService.loadAlertConfigurations(ownerId);
                const realData = alertConfigurationsService.getAlertConfigurations();
                // TODO: REMOVE THIS - Use dummy data if no real data exists
                const dataToShow = realData.length > 0 ? realData : dummyAlertConfigurations;
                setAlertConfigurations(dataToShow);
            };
            if(ownerId)
            {
                loadData();
            }
        };

        // Listen for refresh messages via IPC using the preload method
        const handleRefreshMessage = () => handleRefresh();
        window.addEventListener('refresh-alert-configurations', handleRefreshMessage);
        
        // Cleanup listener on unmount
        return () =>
        {
            window.removeEventListener('refresh-alert-configurations', handleRefreshMessage);
        };
    }, [ownerId]);

    const launchWizardApp = () =>
    {
        // TODO move to config
        window.launchPad.openApp({url: 'http://localhost:3000/alert-wizard', title: "Alert Configurations Wizard", modalFlag: true});
    }

   return(
        <>
            <TitleBarComponent title="Alert Configurations" windowId={windowId} addButtonProps={{ handler: () => launchWizardApp(), tooltipText: "Add new alert configuration..." }} showChannel={false} showTools={false}/>
            <div style={{ width: '100%', height: 'calc(100vh - 65px)', float: 'left', padding: '0px', margin:'45px 0px 0px 0px'}}>
                <GenericGridComponent rowHeight={22} gridTheme={"ag-theme-alpine"} rowIdArray={["id"]}
                                      columnDefs={columnDefs} gridData={alertConfigurations} handleAction={handleAction}/>
            </div>
        </>);
}
