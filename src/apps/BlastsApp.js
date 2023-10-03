import * as React from 'react';
import {useEffect, useMemo, useRef, useState} from "react";
import '../styles/css/main.css';
import {GenericGridComponent} from "../components/GenericGridComponent";
import BlastContentRenderer from "../components/BlastContentRenderer";
import ActionIconsRenderer from "../components/ActionIconsRenderer";
import BlastPlayDialogComponent from "../components/BlastPlayDialogComponent";
import {useRecoilState} from "recoil";
import {blastConfigurationDialogDisplayState, blastPlayDialogDisplayState} from "../atoms/dialog-state";
import {LoggerService} from "../services/LoggerService";
import BlastConfigurationDialogComponent from "../components/BlastConfigurationDialogComponent";
import {selectedGenericGridRowState} from "../atoms/component-state";
import {isEmptyString} from "../utilities";
import {BlastService} from "../services/BlastService";
import {ClientService} from "../services/ClientService";

export const BlastsApp = () =>
{
    const blastService = useRef(new BlastService()).current;
    const clientService = useRef(new ClientService()).current;
    const loggerService = useRef(new LoggerService(BlastsApp.name)).current;
    const [, setBlastPlayDialogOpenFlag ] = useRecoilState(blastPlayDialogDisplayState);
    const [, setBlastConfigurationDialogOpenFlag ] = useRecoilState(blastConfigurationDialogDisplayState);
    const [selectedGenericGridRow, setSelectedGenericGridRow ] = useRecoilState(selectedGenericGridRowState);
    const [blasts, setBlasts] = useState([]);
    const ownerId = "leon";

    const columnDefs = useMemo(() => ([
        {headerName: "Blast Id", field: "blastId", sortable: true, minWidth: 85, width: 85, filter: true, hide:true},
        {headerName: "Blast Name", field: "blastName", hide: false, sortable: true, minWidth: 200, width: 200, filter: true},
        {headerName: "Contents", field: "contents", sortable: true, minWidth: 200, width: 200, filter: true, valueFormatter: params => params.value ? params.value.join(", ") : "",  cellRenderer: BlastContentRenderer },
        {headerName: "Markets", field: "markets", sortable: true, minWidth: 110, width: 110, filter: true, valueFormatter: params => params.value ? params.value.join(", ") : "", },
        {headerName: "ADV Filter", field: "advFilter", sortable: false, minWidth: 150, width: 150, filter: false,
            valueGetter: params => params.data.advFilter,
            valueFormatter: params => Object.entries(params.value).map(([key, value]) => `${key}: ${value}%`).join(", ")},
        {headerName: "Notional Val. Filter", field: "notionalValueFilter", sortable: false, minWidth: 160, width: 160, filter: false,
            valueGetter: params => params.data.notionalValueFilter,
            valueFormatter: params => Object.entries(params.value).map(([key, value]) => `${key}: ${value / 1000000}m`).join(", ")},
        {headerName: "Client", field: "clientId", sortable: true, minWidth: 150, width: 150, filter: true,
            valueGetter: params => params.data.clientId,
            valueFormatter: params => clientService.getClients().find(client => client.clientId === params.value).clientName},
        {headerName: "Trigger Time", field: "triggerTime", sortable: true, minWidth: 120, width: 120, filter: true},
        {headerName: "Actions", field: "actions", sortable: false, minWidth: 170, width: 170, filter: false, cellRenderer: ActionIconsRenderer}
    ]), []);

    const onPlayCloseHandler = () =>
    {

    }

    const onCrudCloseHandler = async (blastName, clientId, markets, contents, rowMarketData, triggerTime) =>
    {
        await saveBlastConfiguration(blastName, clientId, markets, contents, rowMarketData, triggerTime);
    }

    const saveBlastConfiguration = async (blastName, clientId, markets, contents, rowMarketData, triggerTime) =>
    {
        try
        {
            if(isEmptyString(blastName) || isEmptyString(clientId) || contents.length === 0 || markets.length === 0 || rowMarketData.length === 0)
                return;

            const blastConfiguration = {blastName, clientId, markets, contents, rowMarketData, triggerTime};
            loggerService.logInfo(`User adding new blast configuration: ${JSON.stringify(blastConfiguration)}`);
            blastService.addNewBlastConfiguration(ownerId, blastConfiguration)
                .then((id) => setBlasts([...blasts, {...blastConfiguration}]));
        }
        catch (error)
        {
            loggerService.logError(error);
        }
    }

    const updateBlastConfiguration = async (blastConfiguration) =>
    {
        try
        {
            if(isEmptyString(blastConfiguration.blastName) || isEmptyString(blastConfiguration.clientId) || blastConfiguration.contents.length === 0 || blastConfiguration.markets.length === 0)
                return;

            loggerService.logInfo(`Updating existing blast configuration:${JSON.stringify(blastConfiguration)}`);
            blastService.updateBlastConfiguration(ownerId, blastConfiguration)
                .then(() => setBlasts(previousBlasts =>
                {
                    const index = previousBlasts.findIndex(config => config.id === blastConfiguration.blastId);
                    previousBlasts[index] = blastConfiguration;
                    setSelectedGenericGridRow(previousBlasts[index]);
                    return [...previousBlasts];
                }));
        }
        catch (error)
        {
            loggerService.logError(error);
        }
    }

    const deleteBlastConfiguration = async (ownerId, blastId) =>
    {
        try
        {
            loggerService.logInfo(`Deleting existing blast configuration with owner Id: ${ownerId} blastId: ${blastId}.`);
            blastService.deleteBlastConfiguration(ownerId, blastId)
                .then(() => setBlasts(previousBlasts =>
                {
                    const index = previousBlasts.findIndex(blast => blast.blastId === blastId);
                    previousBlasts.splice(index, 1);
                    return [...previousBlasts];
                }));
        }
        catch (error)
        {
            loggerService.logError(error);
        }
    }

    const cloneBlastConfiguration = async (blastId) =>
    {
        try
        {
            loggerService.logInfo(`Cloning existing blast configuration with blastId: ${blastId}`);
            blastService.addNewBlastConfiguration(ownerId)
                .then((id) => setBlasts([...blasts, {...selectedGenericGridRow, blastId: id}]));
        }
        catch (error)
        {
            loggerService.logError(error);
        }
    }

    const handleAction = async (action, blastId) =>
    {
        switch(action)
        {
            case "play":
                setBlastPlayDialogOpenFlag(true);
                loggerService.logInfo(`User opened blast template for blastId: ${blastId}`);
                break;
            case "update":
                loggerService.logInfo(`User updating blast Id: ${blastId}`);
                setSelectedGenericGridRow(blasts.find(blast => blast.blastId === blastId));
                setBlastConfigurationDialogOpenFlag(true);
                break;
            case "delete":
                loggerService.logInfo(`User deleting blast Id: ${blastId}`);
                await deleteBlastConfiguration(ownerId, blastId);
                break;
            case "clone":
                loggerService.logInfo(`User cloning blast Id: ${blastId}`);
                setSelectedGenericGridRow(blasts.find(blast => blast.blastId === blastId));
                setBlastConfigurationDialogOpenFlag(true);
                await cloneBlastConfiguration(blastId);
                break;
            case "add":
                loggerService.logInfo(`User adding new blast`);
                setSelectedGenericGridRow(null);
                setBlastConfigurationDialogOpenFlag(true);
                break;
            default:
                loggerService.logError(`Unknown action: ${action} for blastId: ${blastId}`);
        }
    };

    useEffect(() =>
    {
        clientService.loadClients().then(() => loggerService.logInfo("Clients loaded"));
        blastService.loadBlasts(ownerId).then(() => setBlasts(blastService.getBlasts()));

    }, []);

    return (
        <div style={{ width: '100%', height: '100%', float: 'left', padding: '0px', margin:'0px'}}>
            <div className="ag-theme-alpine" style={{ height: '100%', width: '100%' , padding: '0px', margin:'0px'}}>
                <GenericGridComponent rowHeight={26} gridTheme={"ag-theme-alpine"} rowIdArray={["blastId"]} columnDefs={columnDefs} gridData={blasts} handleAction={handleAction}/>
            </div>
            <BlastConfigurationDialogComponent onCloseHandler={onCrudCloseHandler} clientService={clientService} blastService={blastService}/>
            <BlastPlayDialogComponent onCloseHandler={onPlayCloseHandler}/>
        </div>);
}
