import * as React from 'react';
import {transformLocalDataTime} from "../utilities";
import {GenericGridApp} from "./GenericGridApp";
import {useEffect, useState} from "react";

export const ConfigsApp = ({configurationService}) =>
{
    const [gridData, setGridData] = useState([]);
    const columnDefs = [
        { headerName: "Id", field: 'id', hide: true },
        { headerName: "Owner", field: 'owner', sortable: true, minWidth: 100, width: 130 },
        { headerName: "Key", field: 'key', sortable: true, minWidth: 150, width: 200 },
        { headerName: "Value", field: 'value', sortable: true, minWidth: 200, width: 470 },
        { headerName: "Last Updated By", field: 'lastUpdatedBy', sortable: true, minWidth: 100, maxWidth: 170, width: 170 },
        { headerName: "Last Updated On", field: 'lastUpdatedOn', sortable: true, minWidth: 200, maxWidth: 200, width: 200, valueGetter: (params) =>
        {
            let timestamp = Number((params.data["lastUpdatedOn"]));
            return transformLocalDataTime(timestamp.valueOf());
        }}];

    useEffect(() =>
    {
        setGridData(configurationService.getCachedConfigs());
    }, [configurationService]);

    return(<GenericGridApp rowHeight={25}
                           gridTheme={"ag-theme-alpine"}
                           rowIdArray={["id"]}
                           columnDefs={columnDefs}
                           gridData={gridData}/>);
};
