import * as React from 'react';
import {useMemo, useRef} from "react";
import '../styles/css/main.css';
import {GenericGridComponent} from "../components/GenericGridComponent";
import {DataService} from "../services/DataService";
import BlastContentRenderer from "../components/BlastContentRenderer";
import ActionIconsRenderer from "../components/ActionIconsRenderer";
import BlastPlayDialogComponent from "../components/BlastPlayDialogComponent";
import {useRecoilState} from "recoil";
import {blastConfigurationDialogDisplayState, blastPlayDialogDisplayState} from "../atoms/dialog-state";
import {LoggerService} from "../services/LoggerService";
import BlastConfigurationDialogComponent from "../components/BlastConfigurationDialogComponent";
import {selectedGenericGridRowState} from "../atoms/component-state";

export const BlastsApp = () =>
{
    const dataService = useRef(new DataService()).current;
    const loggerService = useRef(new LoggerService(BlastsApp.name)).current;
    const [blastPlayDialogOpenFlag, setBlastPlayDialogOpenFlag ] = useRecoilState(blastPlayDialogDisplayState);
    const [blastConfigurationDialogOpenFlag, setBlastConfigurationDialogOpenFlag ] = useRecoilState(blastConfigurationDialogDisplayState);
    const [, setSelectedGenericGridRow] = useRecoilState(selectedGenericGridRowState);

    const columnDefs = useMemo(() => ([
        {headerName: "Blast Id", field: "blastId", sortable: true, minWidth: 85, width: 85, filter: true, hide:true},
        {headerName: "Blast Name", field: "blastName", hide: false, sortable: true, minWidth: 170, width: 170, filter: true},
        {headerName: "Contents", field: "contents", sortable: true, minWidth: 200, width: 200, filter: true, valueFormatter: params => params.value ? params.value.join(", ") : "",  cellRenderer: BlastContentRenderer },
        {headerName: "Markets", field: "markets", sortable: true, minWidth: 110, width: 110, filter: true, valueFormatter: params => params.value ? params.value.join(", ") : "", },
        {headerName: "ADV Filter", field: "advFilter", sortable: false, minWidth: 150, width: 150, filter: false,
            valueGetter: params => params.data.advFilter,
            valueFormatter: params => Object.entries(params.value).map(([key, value]) => `${key}: ${value}%`).join(", ")},
        {headerName: "Notional Val. Filter", field: "notionalValueFilter", sortable: false, minWidth: 160, width: 160, filter: false,
            valueGetter: params => params.data.notionalValueFilter,
            valueFormatter: params => Object.entries(params.value).map(([key, value]) => `${key}: ${value / 1000000}m`).join(", ")},
        {headerName: "Client", field: "clientId", sortable: true, minWidth: 80, width: 80, filter: true,
            valueGetter: params => params.data.clientId,
            valueFormatter: params => dataService.getData(DataService.CLIENTS).find(client => client.clientId === params.value).clientName},
        {headerName: "Trigger Time", field: "triggerTime", sortable: true, minWidth: 120, width: 120, filter: true},
        {headerName: "Actions", field: "actions", sortable: false, minWidth: 170, width: 170, filter: false, cellRenderer: ActionIconsRenderer}
    ]), []);

    const handleAction = (action, id) =>
    {
        console.log(`${action}: ${id}`);
        switch(action)
        {
            case "play":
                setBlastPlayDialogOpenFlag(true);
                loggerService.logInfo(`User opened blast template for blastId: ${id}`);
                break;
            case "edit":
                setBlastConfigurationDialogOpenFlag(true);
                loggerService.logInfo(`User editing blastId: ${id}`);
                break;
            case "delete":
                loggerService.logInfo(`User deleting blastId: ${id}`);
                break;
            case "clone":
                setBlastConfigurationDialogOpenFlag(true)
                loggerService.logInfo(`User cloning blastId: ${id}`);
                break;
            case "add":
                setBlastConfigurationDialogOpenFlag(true)
                loggerService.logInfo(`User adding blastId: ${id}`);
                break;
            default:
                loggerService.logError(`Unknown action: ${action} for blastId: ${id}`);
        }
    };

    return (
    <div style={{ width: '100%', height: '100%', float: 'left', padding: '0px', margin:'0px'}}>
        <div className="ag-theme-alpine" style={{ height: '100%', width: '100%' , padding: '0px', margin:'0px'}}>
            <GenericGridComponent rowHeight={26} gridTheme={"ag-theme-alpine"} rowIdArray={["blastId"]} columnDefs={columnDefs} gridData={dataService.getData(DataService.BLASTS)} handleAction={handleAction}/>
        </div>
        <BlastConfigurationDialogComponent onCloseHandler={ console.log("closed")} dataService={dataService}/>
        <BlastPlayDialogComponent onCloseHandler={ console.log("closed")}/>
    </div>);
}
