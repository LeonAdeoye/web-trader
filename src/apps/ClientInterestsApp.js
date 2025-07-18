import {Divider, Grid} from "@mui/material";
import '../styles/css/main.css';
import {ClientListComponent} from "../components/ClientListComponent";
import {ClientInterestsComponent} from "../components/ClientInterestsComponent";
import {Resizable} from "re-resizable";
import React, {useEffect, useRef, useMemo, useState} from "react";
import {useRecoilState} from "recoil";
import ClientInterestDialog from "../dialogs/ClientInterestDialog";
import {ReferenceDataService} from "../services/ReferenceDataService";
import {ClientInterestService} from "../services/ClientInterestService";
import {clientInterestsChangedState, selectedClientState, titleBarContextShareColourState} from "../atoms/component-state";
import TitleBarComponent from "../components/TitleBarComponent";
import {clientInterestDialogDisplayState} from "../atoms/dialog-state";
import {ClientService} from "../services/ClientService";
import {LoggerService} from "../services/LoggerService";

export const ClientInterestsApp = () =>
{
    const [, setClientInterestDialogOpen] = useRecoilState(clientInterestDialogDisplayState);
    const [selectedClient, setSelectedClient] = useRecoilState(selectedClientState);
    const [,setClientInterestsChanged] = useRecoilState(clientInterestsChangedState);
    const [, setTitleBarContextShareColour] = useRecoilState(titleBarContextShareColourState);

    const clientInterestService = useRef(new ClientInterestService()).current;
    const referenceDataService = useRef(new ReferenceDataService()).current;
    const clientService = useRef(new ClientService()).current;
    const loggerService = useRef(new LoggerService(ClientInterestsApp.name)).current;

    const [ownerId, setOwnerId] = useState('');
    const windowId = useMemo(() => window.command.getWindowId("Client Interests"), []);
    const [listOfClients, setListOfClients] = useState([]);

    const closeHandler = async ({instrumentCode, side, notes, clientInterestId}) =>
    {
        setClientInterestsChanged(false);
        if(clientInterestId === null || clientInterestId === undefined || clientInterestId === '')
            await clientInterestService.addNewClientInterest({ownerId, side:side.toUpperCase(), instrumentCode, notes, clientId:selectedClient});
        else
            await clientInterestService.updateClientInterest({ownerId, side:side.toUpperCase(), instrumentCode, notes, clientInterestId, clientId:selectedClient});
        setClientInterestsChanged(true);
    }

    useEffect(() =>
    {
        const loadOwner = async () =>  setOwnerId(await window.configurations.getLoggedInUserId());

        loadOwner();

    }, []);

    useEffect( () =>
    {
        if(ownerId)
        {
            referenceDataService.loadInstruments()
                .then(() => clientInterestService.loadClientInterests(ownerId)
                    .then(() => clientService.loadClients()
                        .then(() =>
                        {
                            const loadedClients = clientService.getClients();
                            if(loadedClients.length > 0)
                            {
                                setListOfClients(loadedClients);
                                setSelectedClient(loadedClients[0].clientId);
                                setClientInterestsChanged(true);
                            }
                        })));
        }

    }, [ownerId]);

    window.messenger.handleMessageFromMain((fdc3Message, _, __) =>
    {
        if(fdc3Message.type === "fdc3.context")
        {
            if(fdc3Message.contextShareColour)
                setTitleBarContextShareColour(fdc3Message.contextShareColour);

            if(fdc3Message.clients?.[0]?.id.name)
                setSelectedClient(clientService.getClientId(fdc3Message.clients[0].id.name));
        }
    });

    return (<>
        <TitleBarComponent title="Client Interests" windowId={windowId} showChannel={true} showTools={false}
           addButtonProps={{ handler: () => setClientInterestDialogOpen({open:true, clear: true}), tooltipText: "Add new client interest...", clearContent: true }} />
        <Grid container direction="column"
              style={{margin: '45px 0px 0px 0px', height: 'calc(100vh - 65px)', overflow: 'hidden'}}>
            <Grid container direction="row" style={{flexGrow: 1, overflow: 'hidden', height: '100%'}}>
                <Resizable defaultSize={{width: '250px', height: '100%'}}>
                    <ClientListComponent listOfClients={listOfClients}/>
                </Resizable>
                <Divider orientation="vertical" style={{backgroundColor: '#404040', width: '1px'}}/>
                <Grid item style={{flexGrow: 1, overflow: 'hidden'}}>
                    <ClientInterestsComponent instrumentService={referenceDataService} clientInterestService={clientInterestService} loggerService={loggerService}/>
                    <ClientInterestDialog closeHandler={closeHandler} instrumentService={referenceDataService} clientInterestService={clientInterestService}/>
                </Grid>
            </Grid>
        </Grid>
    </>);
}
