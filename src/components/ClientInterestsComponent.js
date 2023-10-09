import React, {useRef} from 'react';
import {orderSideStyling} from "../utilities";
import {useEffect, useState, useMemo} from "react";
import '../styles/css/main.css';
import {clientInterestsChangedState, selectedClientState, selectedGenericGridRowState} from "../atoms/component-state";
import {useRecoilState} from "recoil";
import {GenericGridComponent} from "./GenericGridComponent";
import ActionIconsRenderer from "./ActionIconsRenderer";
import {clientInterestDialogDisplayState} from "../atoms/dialog-state";

export const ClientInterestsComponent = ({instrumentService, clientInterestService, loggerService}) =>
{
    const [selectedClient] = useRecoilState(selectedClientState);
    const [clientInterestsChanged, setClientInterestsChanged] = useRecoilState(clientInterestsChangedState);
    const [interests, setInterests] = useState([]);
    const [, setClientInterestDialogOpen] = useRecoilState(clientInterestDialogDisplayState);
    const [, setSelectedGenericGridRow] = useRecoilState(selectedGenericGridRowState);
    const ownerId = useRef("leon").current;

    const columnDefs = useMemo(() => ([
        {headerName: "Stock Code", field: "stockCode", sortable: true, minWidth: 115, width: 115, filter: true},
        {headerName: "Stock Description.", field: "stockDescription", hide: false, sortable: true, minWidth: 170, width: 170, filter: true},
        {headerName: "Side", field: "side", sortable: true, minWidth: 95, width: 95, filter: true, cellStyle: params => orderSideStyling(params.value)},
        {headerName: "Notes", field: "notes", sortable: false, minWidth: 300, width: 95, filter: false},
        {headerName: "Actions", field: "actions", sortable: false, minWidth: 140, width: 140, filter: false, cellRenderer: ActionIconsRenderer}
    ]), []);

    useEffect(() =>
    {
        if(!selectedClient || !clientInterestsChanged)
            return;

        const clientInterests = clientInterestService.getClientInterests().filter(client => client.clientId === selectedClient);
        const updatedRows = clientInterests.map(row =>
        {
            const instrument = instrumentService.getInstruments().find(instrument => instrument.stockCode === row.stockCode);
            return {
                ...row,
                stockDescription: instrument.stockDescription
            };
        });
        setInterests(updatedRows);

    }, [selectedClient, clientInterestsChanged]);

    const handleAction = async (action, data) =>
    {
        setClientInterestsChanged(false);
        switch(action)
        {
            case "update":
                setSelectedGenericGridRow(clientInterestService.getClientInterests().find(interest => interest["clientInterestId"] === data.clientInterestId));
                setClientInterestDialogOpen(true);
                break;
            case "delete":
                await clientInterestService.deleteClientInterest(ownerId, data.clientInterestId);
                setClientInterestsChanged(true);
                break;
            case "clone":
                let interest = clientInterestService.getClientInterests().find(interest => interest["clientInterestId"] === data.clientInterestId);
                setSelectedGenericGridRow({...interest, clientInterestId: null});
                setClientInterestDialogOpen(true);
                break;
            case "add":
                setSelectedGenericGridRow(null);
                setClientInterestDialogOpen(true);
                break;
            default:
                loggerService.logError(`Unknown action: ${action}`);
        }
    };

    return (
        <div style={{ width: '100%', height: '100%', float: 'left', padding: '0px', margin:'0px'}}>
            <div className="ag-theme-alpine" style={{ height: '100%', width: '100%' , padding: '0px', margin:'0px'}}>
                <GenericGridComponent rowHeight={22} gridTheme={"ag-theme-alpine"} rowIdArray={["clientInterestId"]} columnDefs={columnDefs} gridData={interests} handleAction={handleAction}/>
            </div>
        </div>
    );
}
