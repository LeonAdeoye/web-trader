import React, {useEffect, useMemo, useState, useRef} from "react";
import TitleBarComponent from "../components/TitleBarComponent";
import {useRecoilState} from "recoil";
import {alertConfigurationsDialogDisplayState} from "../atoms/dialog-state";
import {GenericGridComponent} from "../components/GenericGridComponent";
import {AlertConfigurationsDialogComponent} from "../components/AlertConfigurationsDialogComponent";
import ActionIconsRenderer from "../components/ActionIconsRenderer";
import {AlertConfigurationsService} from "../services/AlertConfigurationsService";

export const AlertConfigurationsApp = () =>
{
    const [, setAlertConfigurationsDialogDisplay] = useRecoilState(alertConfigurationsDialogDisplayState);
    const windowId = useMemo(() => window.command.getWindowId("alert configurations"), []);
    const [alertConfigs, setAlertConfigs] = useState([]);
    const alertConfigurationsService = useRef(new AlertConfigurationsService()).current;

    const columnDefs = useMemo(() => ([
        {headerName: "Id", field: "id", hide: true, sortable: false, minWidth: 130, width: 130},
        {headerName: "Type", field: "type", sortable: true, minWidth: 170, width: 170, filter: true},
        {headerName: "Alert Name", field: "alertName", sortable: true, minWidth: 400, width: 400, filter: true},
        {headerName: "Time", field: "time", sortable: true, minWidth: 90, width: 90},
        {headerName: "Priority", field: "priority", sortable: true, minWidth: 100, width: 100, filter: true},
        {headerName: "Client", field: "client", sortable: true, minWidth: 100, width: 250, filter: true},
        {headerName: "Actions", field: "actions", sortable: false, minWidth: 140, width: 140, filter: false, cellRenderer: ActionIconsRenderer}
    ]), []);

    useEffect(() =>
    {
        alertConfigurationsService.loadAlertConfigurations()
            .then((configs) => setAlertConfigs(configs));

        setAlertConfigs([{id:1, alertName: "Alert 1", type: "Price", time: "10:00", priority: "High", client: "Client 1"},
            {id:2, alertName: "Alert 2", type: "Price", time: "10:00", priority: "High", client: "Client 1"}]);

    }, [])

    return(
        <>
            <TitleBarComponent title="Alert Configurations" windowId={windowId} addButtonProps={{
                handler: () => setAlertConfigurationsDialogDisplay(true),
                tooltipText: "Add new alert configuration..."
            }} showChannel={false} showTools={false}/>
            <div style={{ width: '100%', height: 'calc(100vh - 65px)', float: 'left', padding: '0px', margin:'45px 0px 0px 0px'}}>
                <GenericGridComponent rowHeight={22}
                                      gridTheme={"ag-theme-alpine"}
                                      rowIdArray={["id"]}
                                      columnDefs={columnDefs}
                                      gridData={alertConfigs}/>
                <AlertConfigurationsDialogComponent/>
            </div>
        </>
    );
}
