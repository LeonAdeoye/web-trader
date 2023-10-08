import {LoggerService} from "../services/LoggerService";
import {Divider, Grid} from "@mui/material";
import '../styles/css/main.css';
import {ClientListComponent} from "../components/ClientListComponent";
import {ClientInterestsComponent} from "../components/ClientInterestsComponent";
import {Resizable} from "re-resizable";
import React, {useEffect, useRef} from "react";
import {useRecoilState} from "recoil";
import ClientInterestDialogComponent from "../components/ClientInterestDialogComponent";
import {InstrumentService} from "../services/InstrumentService";
import {ClientInterestService} from "../services/ClientInterestService";
import {selectedClientState} from "../atoms/component-state";
import TitleBarComponent from "../components/TitleBarComponent";
import {clientInterestDialogDisplayState} from "../atoms/dialog-state";
import {useMemo} from "react";

export const ClientInterestsApp = () =>
{
    const [selectedClient] = useRecoilState(selectedClientState);
    const [, setClientInterestDialogOpen] = useRecoilState(clientInterestDialogDisplayState);
    const clientInterestService = useRef(new ClientInterestService()).current;
    const loggerService = useRef(new LoggerService(ClientInterestsApp.name)).current;
    const instrumentService = useRef(new InstrumentService()).current;
    const ownerId = useRef("leon").current;
    const windowId = useMemo(() => window.command.getWindowId("client-interest"), []);

    const closeHandler = async ({stockCode, side, notes}) =>
    {
        await clientInterestService.addNewClientInterest({ownerId, side:side.toUpperCase(), stockCode, notes, clientId:selectedClient});
    }

    useEffect( () =>
    {
        instrumentService.loadInstruments().then(() => clientInterestService.loadClientInterests(ownerId));
    }, []);

    return (
        <>
            <TitleBarComponent title="Client interest" windowId={windowId} addButtonProps={{
                handler:  () => setClientInterestDialogOpen(true),
                tooltipText: "Add new client interest..."
            }} showChannel={true} showTools={false}/>
            <Grid container direction="column" style={{ height: 'calc(100vh - 67px)', overflow: 'hidden' }}>
                <Grid container direction="row" style={{ flexGrow: 1, overflow: 'hidden', height: '100%' }}>
                    <Resizable defaultSize={{ width: '17%', height: '100%' }}>
                        <ClientListComponent loggerService={loggerService}/>
                    </Resizable>
                    <Divider orientation="vertical" style={{backgroundColor:'#404040', width: '1px'}}/>
                    <Grid item style={{ flexGrow: 1, overflow: 'hidden' }}>
                        <ClientInterestsComponent instrumentService={instrumentService} clientInterestService={clientInterestService}/>
                        <ClientInterestDialogComponent closeHandler={closeHandler} instrumentService={instrumentService}/>
                    </Grid>
                </Grid>
            </Grid>
        </>);
}
