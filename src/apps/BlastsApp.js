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
import TitleBarComponent from "../components/TitleBarComponent";

export const BlastsApp = () =>
{
    const blastService = useRef(new BlastService()).current;
    const clientService = useRef(new ClientService()).current;
    const loggerService = useRef(new LoggerService(BlastsApp.name)).current;
    const [, setBlastPlayDialogOpenFlag ] = useRecoilState(blastPlayDialogDisplayState);
    const [, setBlastConfigurationDialogOpenFlag ] = useRecoilState(blastConfigurationDialogDisplayState);
    const [, setSelectedGenericGridRow ] = useRecoilState(selectedGenericGridRowState);
    const [blasts, setBlasts] = useState([]);
    const ownerId = "leon";
    const windowId = useMemo(() => window.command.getWindowId("client-blasts"), []);

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

    const onCrudCloseHandler = async (blastName, clientId, markets, contents, advFilter, notionalValueFilter, triggerTime, blastId) =>
    {
        if(blastId)
            await updateBlastConfiguration({blastId, blastName, clientId, markets, contents, advFilter, notionalValueFilter, triggerTime, ownerId});
        else
            await saveBlastConfiguration({blastName, clientId, markets, contents, advFilter, notionalValueFilter, triggerTime, ownerId});
    }

    const saveBlastConfiguration = async (blastConfigurationToSave) =>
    {
        try
        {
            if(isEmptyString(blastConfigurationToSave.ownerId) || isEmptyString(blastConfigurationToSave.blastName) || isEmptyString(blastConfigurationToSave.clientId)
                || blastConfigurationToSave.contents.length === 0 || blastConfigurationToSave.markets.length === 0)
                return;

            loggerService.logInfo(`User adding new blast configuration: ${JSON.stringify(blastConfigurationToSave)}`);
            blastService.addNewBlastConfiguration(blastConfigurationToSave)
                .then((newBlast) => setBlasts([...blasts, newBlast]));
        }
        catch (error)
        {
            loggerService.logError(error);
        }
    }

    const updateBlastConfiguration = async (blastConfigurationToUpdate) =>
    {
        try
        {
            if(isEmptyString(blastConfigurationToUpdate.ownerId) || isEmptyString(blastConfigurationToUpdate.blastName) || isEmptyString(blastConfigurationToUpdate.clientId)
                || blastConfigurationToUpdate.contents.length === 0 || blastConfigurationToUpdate.markets.length === 0 || isEmptyString(blastConfigurationToUpdate.blastId))
                return;

            loggerService.logInfo(`Updating existing blast configuration:${JSON.stringify(blastConfigurationToUpdate)}`);
            blastService.updateBlastConfiguration(blastConfigurationToUpdate)
                .then(() => setBlasts(previousBlasts =>
                {
                    const index = previousBlasts.findIndex(currentBlast => currentBlast.blastId === blastConfigurationToUpdate.blastId);
                    previousBlasts[index] = blastConfigurationToUpdate;
                    setSelectedGenericGridRow(blastConfigurationToUpdate);
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

    const handleAction = async (action, blastId) =>
    {
        switch(action)
        {
            case "play":
                setBlastPlayDialogOpenFlag(true);
                break;
            case "update":
                setSelectedGenericGridRow(blasts.find(blast => blast.blastId === blastId));
                setBlastConfigurationDialogOpenFlag(true);
                break;
            case "delete":
                await deleteBlastConfiguration(ownerId, blastId);
                break;
            case "clone":
                let blast = blasts.find(blast => blast.blastId === blastId);
                setSelectedGenericGridRow({...blast, blastId: null});
                setBlastConfigurationDialogOpenFlag(true);
                break;
            case "add":
                setSelectedGenericGridRow(null);
                setBlastConfigurationDialogOpenFlag(true);
                break;
            default:
                loggerService.logError(`Unknown action: ${action} for blastId: ${blastId}`);
        }
    };

    useEffect(() =>
    {
        const loadData = async () =>
        {
            await clientService.loadClients();
            await blastService.loadBlasts(ownerId);
            setBlasts(blastService.getBlasts());
        };

        loadData();
    }, []);


    return (
        <>
            <TitleBarComponent title="Client Blasts" windowId={windowId} addButtonProps={{
                handler:  () => setBlastConfigurationDialogOpenFlag(true),
                tooltipText: "Add new client blast..."
            }} showChannel={true} showTools={false}/>
            <div style={{ width: '100%', height: 'calc(100vh - 67px)', float: 'left', padding: '0px', margin:'0px'}}>
                <div className="ag-theme-alpine" style={{ height: '100%', width: '100%' , padding: '0px', margin:'0px'}}>
                    <GenericGridComponent rowHeight={26} gridTheme={"ag-theme-alpine"} rowIdArray={["blastId"]} columnDefs={columnDefs} gridData={blasts} handleAction={handleAction}/>
                </div>
                <BlastConfigurationDialogComponent onCloseHandler={onCrudCloseHandler} clientService={clientService}/>
                <BlastPlayDialogComponent/>
            </div>
        </>);
}
