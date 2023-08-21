import * as React from 'react';
import {transformLocalDataTime} from "../utilities";
import {GenericGridApp} from "./GenericGridApp";

export const ConfigsApp = () =>
{
    const columnDefs = [
        { field: 'id', hide: true },
        { field: 'owner', sortable: true, minWidth: 100, width: 130 },
        { field: 'key', sortable: true, minWidth: 150, width: 200 },
        { field: 'value', sortable: true, minWidth: 200, width: 470 },
        { field: 'lastUpdatedBy', sortable: true, minWidth: 100, maxWidth: 170, width: 170 },
        { headerName: "Last Updated On", field: 'lastUpdatedOn', sortable: true, minWidth: 200, maxWidth: 200, width: 200, valueGetter: (params) =>
        {
            let timestamp = Number((params.data["lastUpdatedOn"]));
            return transformLocalDataTime(timestamp.valueOf());
        }}];

    return(<GenericGridApp initUrl={"http://localhost:20001/configurations"}
                           rowHeight={25}
                           gridTheme={"ag-theme-alpine"}
                           rowIdArray={["id"]}
                           columnDefs={columnDefs} />);
};
