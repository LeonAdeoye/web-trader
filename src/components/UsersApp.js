import * as React from 'react';
import {GenericGridApp} from "./GenericGridApp";

export const UsersApp = () =>
{
    const columnDefs = [
            { headerName: "User Id", field: "userId", sortable: true, minWidth: 100, width: 130 },
            { headerName: "Full Name", field: "fullName", sortable: true, minWidth: 250, width: 250 },
            { headerName: "Region", field: "region", sortable: true, minWidth: 100, width: 100 },
            { headerName: "Country", field: "countryCode", sortable: true, minWidth: 150, width: 150 },
            { headerName: "Location", field: "location", sortable: true, minWidth: 150, maxWidth: 150, width: 150},
            { headerName: "Is Active", field: "active", minWidth: 120, maxWidth: 120, width: 120 }];

    return(<GenericGridApp initUrl={"http://localhost:20003/users"}
                           rowHeight={25}
                           gridTheme={"ag-theme-alpine"}
                           rowIdArray={["userId"]}
                           columnDefs={columnDefs} />);
};
