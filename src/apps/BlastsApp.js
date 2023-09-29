import * as React from 'react';
import {useMemo, useState} from "react";
import '../styles/css/main.css';
import {GenericGridComponent} from "../components/GenericGridComponent";
import {DataService} from "../services/DataService";
import {numberFormatter} from "../utilities";

export const BlastsApp = () =>
{
    const [dataService] = useState(new DataService());

    const columnDefs = useMemo(() => ([
        {headerName: "Blast Id", field: "blastId", sortable: true, minWidth: 85, width: 85, filter: true, hide:true},
        {headerName: "Blast Name", field: "blastName", hide: false, sortable: true, minWidth: 170, width: 170, filter: true},
        {headerName: "Contents", field: "contents", sortable: true, minWidth: 150, width: 150, filter: true},
        {headerName: "Markets", field: "markets", sortable: true, minWidth: 110, width: 110, filter: true},
        {headerName: "ADV% Filter", field: "advFilter", sortable: false, minWidth: 100, width: 100, filter: false},
        {headerName: "Notional Val. Filter", field: "notionalValueFilter", sortable: false, minWidth: 110, width: 110, filter: false, valueFormatter: numberFormatter},
        {headerName: "Client", field: "clientId", sortable: true, minWidth: 80, width: 80, filter: true},
        {headerName: "Trigger Time", field: "triggerTime", sortable: true, minWidth: 120, width: 120, filter: true},
        {headerName: "Actions", field: "actions", sortable: false, minWidth: 100, width: 100, filter: false}
    ]), []);

    return (
    <div style={{ width: '100%', height: '100%', float: 'left', padding: '0px', margin:'0px'}}>
        <div className="ag-theme-alpine" style={{ height: '100%', width: '100%' , padding: '0px', margin:'0px'}}>
            <GenericGridComponent rowHeight={22} gridTheme={"ag-theme-alpine"} rowIdArray={["blastId"]} columnDefs={columnDefs} gridData={dataService.getData(DataService.BLASTS)}/>
        </div>
    </div>);
}
