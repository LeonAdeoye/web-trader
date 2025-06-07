import React, {useRef} from 'react';
import {orderSideStyling, sideValueConverter} from "../utilities";
import {useEffect, useState, useMemo} from "react";
import '../styles/css/main.css';
import {clientInterestsChangedState, selectedClientState, selectedGenericGridRowState} from "../atoms/component-state";
import {useRecoilState} from "recoil";
import {GenericGridComponent} from "./GenericGridComponent";
import ActionIconsRenderer from "./ActionIconsRenderer";
import {clientInterestDialogDisplayState} from "../atoms/dialog-state";

export const ClientInterestsComponent = ({instrumentService, clientInterestService, loggerService}) =>
{
    const [selectedClient, setSelectedClient] = useRecoilState(selectedClientState);
    const [clientInterestsChanged, setClientInterestsChanged] = useRecoilState(clientInterestsChangedState);
    const [, setClientInterestDialogOpen] = useRecoilState(clientInterestDialogDisplayState);
    const [, setSelectedGenericGridRow] = useRecoilState(selectedGenericGridRowState);
    const [interests, setInterests] = useState([]);
    const [ownerId, setOwnerId] = useState('');

    const columnDefs = useMemo(() => ([
        {headerName: "Instrument", field: "instrumentCode", sortable: true, minWidth: 115, width: 115, filter: true},
        {headerName: "Instrument Description", field: "instrumentDescription", hide: false, sortable: true, minWidth: 290, width: 290, filter: true},
        {headerName: "Side", field: "side", sortable: true, minWidth: 95, width: 95, filter: true, cellStyle: params => orderSideStyling(params.value), valueFormatter: params => sideValueConverter(params.value)},
        {headerName: "Notes", field: "notes", sortable: false, minWidth: 300, width: 95, filter: false},
        {headerName: "Actions", field: "actions", sortable: false, minWidth: 140, width: 140, filter: false, cellRenderer: ActionIconsRenderer}
    ]), []);

    useEffect(() =>
    {
        const loadOwner = async () =>  setOwnerId(await window.configurations.getLoggedInUserId());

        loadOwner();

    }, []);

    useEffect(() =>
    {
        if(!selectedClient || !clientInterestsChanged)
            return;

        console.log("Client interests changed, reloading data...");

        const clientInterests = clientInterestService.getClientInterests().filter(client => client.clientId === selectedClient);
        const updatedRows = clientInterests.map(row =>
        {
            const instrument = instrumentService.getInstruments().find(instrument => instrument.instrumentCode === row.instrumentCode);
            return {
                ...row,
                instrumentDescription: instrument.instrumentDescription
            };
        });
        setInterests(updatedRows);

    }, [selectedClient, clientInterestsChanged]);

    const handleAction = async (action, data) =>
    {

        switch(action)
        {
            case "update":
                setSelectedGenericGridRow(clientInterestService.getClientInterests().find(interest => interest["clientInterestId"] === data.clientInterestId));
                setClientInterestDialogOpen({open:true, clear:false});
                break;
            case "delete":
                setClientInterestsChanged(false);
                await clientInterestService.deleteClientInterest(ownerId, data.clientInterestId);
                setClientInterestsChanged(true);
                break;
            case "clone":
                let interest = clientInterestService.getClientInterests().find(interest => interest["clientInterestId"] === data.clientInterestId);
                setSelectedGenericGridRow({...interest, clientInterestId: null});
                setClientInterestDialogOpen({open:true, clear:false});
                break;
            case "add":
                setSelectedGenericGridRow(null);
                setClientInterestDialogOpen({open: true, clear:true});
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
