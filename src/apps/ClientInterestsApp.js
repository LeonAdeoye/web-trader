import {Divider, Grid} from "@mui/material";
import '../styles/css/main.css';
import {ClientListComponent} from "../components/ClientListComponent";
import {ClientInterestsComponent} from "../components/ClientInterestsComponent";
import {Resizable} from "re-resizable";
import React, {useEffect, useRef, useMemo, useState} from "react";
import {useRecoilState} from "recoil";
import ClientInterestDialogComponent from "../components/ClientInterestDialogComponent";
import {InstrumentService} from "../services/InstrumentService";
import {ClientInterestService} from "../services/ClientInterestService";
import {
    clientInterestsChangedState,
    selectedClientState,
    titleBarContextShareColourState
} from "../atoms/component-state";
import TitleBarComponent from "../components/TitleBarComponent";
import {clientInterestDialogDisplayState} from "../atoms/dialog-state";
import {ClientService} from "../services/ClientService";
import {LoggerService} from "../services/LoggerService";

export const ClientInterestsApp = () =>
{
    const [selectedClient] = useRecoilState(selectedClientState);
    const [, setClientInterestDialogOpen] = useRecoilState(clientInterestDialogDisplayState);
    const [, setSelectedClient] = useRecoilState(selectedClientState);
    const [,setClientInterestsChanged] = useRecoilState(clientInterestsChangedState);
    const clientInterestService = useRef(new ClientInterestService()).current;
    const instrumentService = useRef(new InstrumentService()).current;
    const clientService = useRef(new ClientService()).current;
    const loggerService = useRef(new LoggerService(ClientInterestsApp.name)).current;
    const ownerId = useRef("leon").current;
    const windowId = useMemo(() => window.command.getWindowId("client-interest"), []);
    const [listOfClients, setListOfClients] = useState([]);
    const [, setTitleBarContextShareColour] = useRecoilState(titleBarContextShareColourState);

    const closeHandler = async ({stockCode, side, notes}) =>
    {
        setClientInterestsChanged(false);
        await clientInterestService.addNewClientInterest({ownerId, side:side.toUpperCase(), stockCode, notes, clientId:selectedClient});
        setClientInterestsChanged(true);
    }

    useEffect( () =>
    {
        instrumentService.loadInstruments()
            .then(() => clientInterestService.loadClientInterests(ownerId)
                .then(() => clientService.loadClients()
                    .then(() =>
                    {
                        const loadedClients = clientService.getClients();
                        if(loadedClients.length > 0)
                        {
                            setListOfClients(loadedClients);
                            setSelectedClient(loadedClients[0].clientId);
                        }
                    })));
    }, []);

    useEffect(() =>
    {
        window.messenger.handleMessageFromMain((fdc3Message, _, __) =>
        {
            if(fdc3Message.type === "fdc3.context" && fdc3Message.clients?.[0]?.id.name)
                setSelectedClient(clientService.getClientId(fdc3Message.clients[0].id.name));
            else if(fdc3Message.type === "fdc3.context" && fdc3Message.contextShareColour)
                    setTitleBarContextShareColour(fdc3Message.contextShareColour);
        });
    }, []);


    return (<>
        <TitleBarComponent title="Client Interests" windowId={windowId} addButtonProps={{
            handler: () => setClientInterestDialogOpen(true),
            tooltipText: "Add new client interest..."
        }} showChannel={true} showTools={false}/>
        <Grid container direction="column"
              style={{margin: '45px 0px 0px 0px', height: 'calc(100vh - 65px)', overflow: 'hidden'}}>
            <Grid container direction="row" style={{flexGrow: 1, overflow: 'hidden', height: '100%'}}>
                <Resizable defaultSize={{width: '17%', height: '100%'}}>
                    <ClientListComponent listOfClients={listOfClients}/>
                </Resizable>
                <Divider orientation="vertical" style={{backgroundColor: '#404040', width: '1px'}}/>
                <Grid item style={{flexGrow: 1, overflow: 'hidden'}}>
                    <ClientInterestsComponent instrumentService={instrumentService} clientInterestService={clientInterestService} loggerService={loggerService}/>
                    <ClientInterestDialogComponent closeHandler={closeHandler} instrumentService={instrumentService} clientInterestService={clientInterestService}/>
                </Grid>
            </Grid>
        </Grid>
    </>);
}
