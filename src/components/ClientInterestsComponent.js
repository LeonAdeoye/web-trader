import React from 'react';
import {orderSideStyling} from "../utilities";
import {useEffect, useState, useMemo, useRef} from "react";
import '../styles/css/main.css';
import {selectedClientState} from "../atoms/component-state";
import {useRecoilState} from "recoil";
import {DataService} from "../services/DataService";
import {GenericGridComponent} from "./GenericGridComponent";

export const ClientInterestsComponent = ({loggerService}) =>
{
    const [selectedClient] = useRecoilState(selectedClientState);
    const dataService = useRef(new DataService()).current;
    const [interests, setInterests] = useState([]);

    const columnDefs = useMemo(() => ([
        {headerName: "Symbol", field: "stockCode", sortable: true, minWidth: 115, width: 115, filter: true},
        {headerName: "Stock Desc.", field: "stockDescription", hide: false, sortable: true, minWidth: 170, width: 170, filter: true},
        {headerName: "Side", field: "side", sortable: true, minWidth: 95, width: 95, filter: true, cellStyle: params => orderSideStyling(params.value)},
        {headerName: "Notes", field: "notes", sortable: false, minWidth: 300, width: 95, filter: false}
    ]), []);

    useEffect(() =>
    {
        if(selectedClient)
            setInterests(dataService.getData(DataService.INTERESTS).filter(client => client.client === selectedClient));
    }, [selectedClient]);

    return (
        <div style={{ width: '100%', height: '100%', float: 'left', padding: '0px', margin:'0px'}}>
            <div className="ag-theme-alpine" style={{ height: '100%', width: '100%' , padding: '0px', margin:'0px'}}>
                <GenericGridComponent rowHeight={22} gridTheme={"ag-theme-alpine"} rowIdArray={["stockCode"]} columnDefs={columnDefs} gridData={interests}/>
            </div>
        </div>
    );
}
